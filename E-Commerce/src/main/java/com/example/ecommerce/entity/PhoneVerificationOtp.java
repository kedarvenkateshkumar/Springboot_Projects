
package com.example.ecommerce.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "phone_verification_otps")
public class PhoneVerificationOtp {

    @Id
    @Column(name = "user_id")
    private Long userId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "target_phone", nullable = false)
    private String targetPhone;

    @Column(name = "code_hash", nullable = false, length = 64)
    private String codeHash;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(nullable = false)
    private int attempts;

    @Column(name = "last_sent_at", nullable = false)
    private Instant lastSentAt;

    public PhoneVerificationOtp() {
    }

    public Long getUserId() { return userId; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getTargetPhone() { return targetPhone; }
    public void setTargetPhone(String targetPhone) {
        this.targetPhone = targetPhone;
    }

    public String getCodeHash() { return codeHash; }
    public void setCodeHash(String codeHash) {
        this.codeHash = codeHash;
    }

    public Instant getExpiresAt() { return expiresAt; }
    public void setExpiresAt(Instant expiresAt) {
        this.expiresAt = expiresAt;
    }

    public int getAttempts() { return attempts; }
    public void setAttempts(int attempts) {
        this.attempts = attempts;
    }

    public Instant getLastSentAt() { return lastSentAt; }
    public void setLastSentAt(Instant lastSentAt) {
        this.lastSentAt = lastSentAt;
    }
}
