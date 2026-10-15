package com.example.ecommerce.service;

import com.example.ecommerce.dto.UserProfileRequest;
import com.example.ecommerce.dto.UserProfileResponse;
import com.example.ecommerce.entity.User;
import com.example.ecommerce.repository.UserRepo;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class UserProfileService {

    private final UserRepo userRepository;

    public UserProfileService(UserRepo userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(User user) {
        return toResponse(user);
    }

    @Transactional
    public UserProfileResponse updateProfile(
            User user,
            UserProfileRequest request) {

        // Validate username
        String username = request.getUsername().trim();

        if (username.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Username cannot be empty"
            );
        }

        // Normalize optional contact details
        String email = normalize(request.getEmail());
        String phone = normalize(request.getPhoneNumber());

        // Check whether another account uses this email
        if (email != null
                && !email.equalsIgnoreCase(user.getEmail())
                && userRepository.existsByEmailAndIdNot(
                email, user.getId())) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Email is already registered"
            );
        }

        // Check whether another account uses this phone
        if (phone != null
                && !phone.equals(user.getPhoneNumber())
                && userRepository.existsByPhoneNumberAndIdNot(
                phone, user.getId())) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Phone number is already registered"
            );
        }

        // Reset verification only when the contact value changes
        if (!sameEmail(user.getEmail(), email)) {
            user.setEmail(email);
            user.setEmailVerified(false);
        }

        if (!java.util.Objects.equals(
                user.getPhoneNumber(), phone)) {
            user.setPhoneNumber(phone);
            user.setPhoneVerified(false);
        }

        // Update permitted profile fields only
        user.setUsername(username);
        user.setAddressLine(normalize(request.getAddressLine()));
        user.setCity(normalize(request.getCity()));
        user.setState(normalize(request.getState()));
        user.setPostalCode(normalize(request.getPostalCode()));
        user.setCountry(normalize(request.getCountry()));

        User savedUser = userRepository.save(user);

        return toResponse(savedUser);
    }

    private String normalize(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private boolean sameEmail(String first, String second) {
        if (first == null || second == null) {
            return first == second;
        }
        return first.equalsIgnoreCase(second);
    }

    private UserProfileResponse toResponse(User user) {
        return new UserProfileResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getPhoneNumber(),
                user.getAddressLine(),
                user.getCity(),
                user.getState(),
                user.getPostalCode(),
                user.getCountry(),
                null, // Profile image endpoint will be added later
                user.getRole().name(),
                user.isEmailVerified(),
                user.isPhoneVerified()
        );
    }
}