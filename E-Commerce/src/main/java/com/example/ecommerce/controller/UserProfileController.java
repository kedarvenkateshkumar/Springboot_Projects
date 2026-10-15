package com.example.ecommerce.controller;

import com.example.ecommerce.dto.UserProfileRequest;
import com.example.ecommerce.dto.UserProfileResponse;
import com.example.ecommerce.entity.UserPrinciples;
import com.example.ecommerce.service.UserProfileService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserProfileController {

    private final UserProfileService userProfileService;

    public UserProfileController(
            UserProfileService userProfileService) {
        this.userProfileService = userProfileService;
    }

    @GetMapping("/me")
    public UserProfileResponse getMyProfile(
            @AuthenticationPrincipal UserPrinciples principal) {

        return userProfileService.getProfile(
                principal.getUser()
        );
    }

    @PutMapping("/me")
    public UserProfileResponse updateMyProfile(
            @AuthenticationPrincipal UserPrinciples principal,
            @Valid @RequestBody UserProfileRequest request) {

        return userProfileService.updateProfile(
                principal.getUser(),
                request
        );
    }
}