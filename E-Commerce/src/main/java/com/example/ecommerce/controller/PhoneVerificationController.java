package com.example.ecommerce.controller;

import com.example.ecommerce.dto.PhoneOtpRequest;
import com.example.ecommerce.entity.UserPrinciples;
import com.example.ecommerce.service.PhoneVerificationService;
import jakarta.validation.Valid;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@Profile("dev")
@RequestMapping("/api/users/me/phone-verification")
public class PhoneVerificationController {

    private final PhoneVerificationService service;

    public PhoneVerificationController(
            PhoneVerificationService service) {
        this.service = service;
    }

    @PostMapping("/request")
    public ResponseEntity<Void> requestOtp(
            @AuthenticationPrincipal UserPrinciples principal) {

        service.requestOtp(principal.getUser());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/confirm")
    public ResponseEntity<Void> confirmOtp(
            @AuthenticationPrincipal UserPrinciples principal,
            @Valid @RequestBody PhoneOtpRequest request) {

        service.confirmOtp(
                principal.getUser(),
                request.getOtp());

        return ResponseEntity.noContent().build();
    }
}