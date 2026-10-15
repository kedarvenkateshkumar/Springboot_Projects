package com.example.ecommerce.dto;

import jakarta.validation.constraints.Pattern;

public class EmailOtpRequest {

    @Pattern(regexp = "^[0-9]{6}$", message = "OTP must contain 6 digits")
    private String otp;

    public EmailOtpRequest() {
    }

    public String getOtp() {
        return otp;
    }

    public void setOtp(String otp) {
        this.otp = otp;
    }
}