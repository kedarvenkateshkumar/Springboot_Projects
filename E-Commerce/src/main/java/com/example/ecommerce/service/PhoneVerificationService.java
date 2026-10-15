
package com.example.ecommerce.service;

import com.example.ecommerce.entity.PhoneVerificationOtp;
import com.example.ecommerce.entity.User;
import com.example.ecommerce.repository.PhoneVerificationOtpRepository;
import com.example.ecommerce.repository.UserRepo;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.HexFormat;

@Service
@Profile("dev")
public class PhoneVerificationService {

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final int MAX_ATTEMPTS = 5;
    private static final Duration OTP_LIFETIME = Duration.ofMinutes(10);
    private static final Duration RESEND_DELAY = Duration.ofSeconds(60);

    private final PhoneVerificationOtpRepository otpRepository;
    private final UserRepo userRepository;
    private final MockSmsService mockSmsService;
    private final byte[] secret;

    public PhoneVerificationService(
            PhoneVerificationOtpRepository otpRepository,
            UserRepo userRepository,
            MockSmsService mockSmsService,
            @Value("${app.verification.hmac-secret}") String secret) {

        this.otpRepository = otpRepository;
        this.userRepository = userRepository;
        this.mockSmsService = mockSmsService;
        this.secret = secret.getBytes(StandardCharsets.UTF_8);

        if (this.secret.length < 32) {
            throw new IllegalStateException(
                    "OTP HMAC secret must be at least 32 bytes");
        }
    }

    public void requestOtp(User user) {
        String phone = user.getPhoneNumber();

        if (phone == null || phone.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Add a phone number to your profile first");
        }

        if (user.isPhoneVerified()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Phone number is already verified");
        }

        Instant now = Instant.now();

        PhoneVerificationOtp otp = otpRepository.findById(user.getId())
                .orElseGet(PhoneVerificationOtp::new);

        if (otp.getLastSentAt() != null
                && now.isBefore(otp.getLastSentAt().plus(RESEND_DELAY))) {
            throw new ResponseStatusException(
                    HttpStatus.TOO_MANY_REQUESTS,
                    "Please wait 60 seconds before requesting another OTP");
        }

        String code = String.format("%06d", RANDOM.nextInt(1_000_000));

        otp.setUser(user);
        otp.setTargetPhone(phone);
        otp.setCodeHash(hashOtp(user.getId(), phone, code));
        otp.setExpiresAt(now.plus(OTP_LIFETIME));
        otp.setAttempts(0);
        otp.setLastSentAt(now);

        otpRepository.save(otp);

        mockSmsService.sendOtp(phone, code);
    }

    public void confirmOtp(User user, String code) {
        PhoneVerificationOtp otp = otpRepository.findById(user.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Request an OTP first"));

        Instant now = Instant.now();

        if (otp.getAttempts() >= MAX_ATTEMPTS) {
            throw new ResponseStatusException(
                    HttpStatus.TOO_MANY_REQUESTS,
                    "Too many incorrect attempts. Request a new OTP later.");
        }

        if (!now.isBefore(otp.getExpiresAt())) {
            otpRepository.delete(otp);
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "OTP expired. Request a new one.");
        }

        if (user.getPhoneNumber() == null
                || !user.getPhoneNumber().equals(otp.getTargetPhone())) {
            otpRepository.delete(otp);
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Phone number changed. Request a new OTP.");
        }

        String expectedHash =
                hashOtp(user.getId(), otp.getTargetPhone(), code);

        boolean matches = MessageDigest.isEqual(
                expectedHash.getBytes(StandardCharsets.US_ASCII),
                otp.getCodeHash().getBytes(StandardCharsets.US_ASCII));

        if (!matches) {
            otp.setAttempts(otp.getAttempts() + 1);
            otpRepository.save(otp);

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Incorrect OTP");
        }

        user.setPhoneVerified(true);
        userRepository.save(user);
        otpRepository.delete(otp);
    }

    private String hashOtp(Long userId, String phone, String code) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret, "HmacSHA256"));

            String value = userId + ":" + phone + ":" + code;

            return HexFormat.of().formatHex(
                    mac.doFinal(value.getBytes(StandardCharsets.UTF_8)));

        } catch (GeneralSecurityException ex) {
            throw new IllegalStateException("Unable to hash OTP", ex);
        }
    }
}
