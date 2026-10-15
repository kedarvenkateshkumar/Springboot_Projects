package com.example.ecommerce.repository;

import com.example.ecommerce.entity.PhoneVerificationOtp;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PhoneVerificationOtpRepository
        extends JpaRepository<PhoneVerificationOtp, Long> {
}