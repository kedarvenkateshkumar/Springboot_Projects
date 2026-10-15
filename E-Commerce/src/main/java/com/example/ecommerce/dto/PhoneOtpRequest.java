package com.example.ecommerce.dto;

import jakarta.validation.constraints.Pattern;

public class PhoneOtpRequest {

    @Pattern(
            regexp = "^[0-9]{6}$",
            message = "OTP must contain exactly 6 digits"
    )
    private String otp;

    public PhoneOtpRequest() {
    }

    public String getOtp() {
        return otp;
    }

    public void setOtp(String otp) {
        this.otp = otp;
    }
}