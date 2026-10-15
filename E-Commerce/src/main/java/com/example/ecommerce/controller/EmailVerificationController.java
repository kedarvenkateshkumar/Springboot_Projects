package com.example.ecommerce.controller;

import com.example.ecommerce.dto.EmailOtpRequest;
import com.example.ecommerce.entity.UserPrinciples;
import com.example.ecommerce.service.EmailVerificationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users/me/email-verification")
public class EmailVerificationController {

    private final EmailVerificationService verificationService;

    public EmailVerificationController(
            EmailVerificationService verificationService) {
        this.verificationService = verificationService;
    }

    @PostMapping("/request")
    public ResponseEntity<Void> requestOtp(
            @AuthenticationPrincipal UserPrinciples principal) {

        verificationService.requestOtp(principal.getUser());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/confirm")
    public ResponseEntity<Void> confirmOtp(
            @AuthenticationPrincipal UserPrinciples principal,
            @Valid @RequestBody EmailOtpRequest request) {

        verificationService.confirmOtp(
                principal.getUser(),
                request.getOtp());

        return ResponseEntity.noContent().build();
    }
}