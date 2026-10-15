package com.example.ecommerce.service;

import com.example.ecommerce.entity.EmailVerificationOtp;
import com.example.ecommerce.entity.User;
import com.example.ecommerce.repository.EmailVerificationOtpRepository;
import com.example.ecommerce.repository.UserRepo;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class EmailVerificationService {

    private static final Logger log =
            LoggerFactory.getLogger(EmailVerificationService.class);

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final Duration OTP_LIFETIME = Duration.ofMinutes(10);
    private static final Duration RESEND_DELAY = Duration.ofSeconds(60);
    private static final int MAX_ATTEMPTS = 5;

    private final EmailVerificationOtpRepository otpRepository;
    private final UserRepo userRepository;
    private final JavaMailSender mailSender;
    private final byte[] hmacSecret;

    public EmailVerificationService(
            EmailVerificationOtpRepository otpRepository,
            UserRepo userRepository,
            JavaMailSender mailSender,
            @Value("${app.verification.hmac-secret}") String hmacSecret) {

        this.otpRepository = otpRepository;
        this.userRepository = userRepository;
        this.mailSender = mailSender;
        this.hmacSecret = hmacSecret.getBytes(StandardCharsets.UTF_8);

        if (this.hmacSecret.length < 32) {
            throw new IllegalStateException(
                    "OTP HMAC secret must be at least 32 bytes");
        }
    }

    @Transactional
    public void requestOtp(User user) {
        String email = user.getEmail();

        if (email == null || email.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Add an email address to your profile first");
        }

        if (user.isEmailVerified()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Email is already verified");
        }

        Instant now = Instant.now();

        EmailVerificationOtp otp = otpRepository.findById(user.getId())
                .orElseGet(EmailVerificationOtp::new);

        if (otp.getLastSentAt() != null
                && now.isBefore(otp.getLastSentAt().plus(RESEND_DELAY))) {
            throw new ResponseStatusException(
                    HttpStatus.TOO_MANY_REQUESTS,
                    "Please wait before requesting another OTP");
        }

        String code = String.format("%06d", RANDOM.nextInt(1_000_000));

        otp.setUser(user);
        otp.setTargetEmail(email);
        otp.setCodeHash(hashOtp(user.getId(), email, code));
        otp.setExpiresAt(now.plus(OTP_LIFETIME));
        otp.setAttempts(0);
        otp.setLastSentAt(now);

        otpRepository.saveAndFlush(otp);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper =
                    new MimeMessageHelper(message, StandardCharsets.UTF_8.name());

            helper.setTo(email);
            helper.setSubject("Your email verification code");
            helper.setText(
                    "Your verification code is: " + code
                            + "\n\nIt expires in 10 minutes."
                            + "\nIf you did not request this code, you can ignore this email.",
                    false);

            mailSender.send(message);

        }catch (MessagingException | RuntimeException ex) {

        log.error(
                "Failed to send verification email for userId={}",
                user.getId(),
                ex
        );

        otpRepository.delete(otp);
        otpRepository.flush();

        throw new ResponseStatusException(
                HttpStatus.SERVICE_UNAVAILABLE,
                "Unable to send verification email. Please try again."
        );
    }
    }

    @Transactional
    public void confirmOtp(User user, String code) {
        EmailVerificationOtp otp = otpRepository.findById(user.getId())
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
                    "OTP has expired. Request a new one.");
        }

        // Prevent an OTP sent to an old email from verifying a new one.
        if (user.getEmail() == null
                || !user.getEmail().equalsIgnoreCase(otp.getTargetEmail())) {
            otpRepository.delete(otp);
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Email changed. Request a new OTP.");
        }

        String expectedHash =
                hashOtp(user.getId(), otp.getTargetEmail(), code);

        if (!MessageDigest.isEqual(
                expectedHash.getBytes(StandardCharsets.US_ASCII),
                otp.getCodeHash().getBytes(StandardCharsets.US_ASCII))) {

            otp.setAttempts(otp.getAttempts() + 1);
            otpRepository.save(otp);

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Incorrect OTP");
        }

        user.setEmailVerified(true);
        userRepository.save(user);
        otpRepository.delete(otp);
    }

    private String hashOtp(Long userId, String email, String code) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(hmacSecret, "HmacSHA256"));

            String value = userId + ":" + email.toLowerCase() + ":" + code;

            return HexFormat.of().formatHex(
                    mac.doFinal(value.getBytes(StandardCharsets.UTF_8)));

        } catch (GeneralSecurityException ex) {
            throw new IllegalStateException("Unable to hash OTP", ex);
        }
    }
}