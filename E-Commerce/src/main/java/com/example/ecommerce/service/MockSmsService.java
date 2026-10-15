
package com.example.ecommerce.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

@Service
@Profile("dev")
public class MockSmsService {

    private static final Logger log =
            LoggerFactory.getLogger(MockSmsService.class);

    public void sendOtp(String phoneNumber, String otp) {
        // Development only: never log OTPs in production.
        log.info("MOCK SMS sent to {}. Development OTP: {}",
                phoneNumber, otp);
    }
}
