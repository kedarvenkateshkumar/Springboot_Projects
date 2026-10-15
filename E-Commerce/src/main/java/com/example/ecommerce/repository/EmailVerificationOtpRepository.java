package com.example.ecommerce.repository;

import com.example.ecommerce.entity.EmailVerificationOtp;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmailVerificationOtpRepository
        extends JpaRepository<EmailVerificationOtp, Long> {
}