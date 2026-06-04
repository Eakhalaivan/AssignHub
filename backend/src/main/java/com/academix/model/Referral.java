package com.academix.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "referrals")
public class Referral {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "referrer_id", nullable = false)
    private User referrer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "referred_id", nullable = false, unique = true)
    private User referred;

    @Column(name = "referral_code", nullable = false)
    private String referralCode;

    @Column(nullable = false)
    private String status = "REGISTERED"; // REGISTERED, QUALIFIED

    @Column(name = "reward_paid", nullable = false)
    private boolean rewardPaid = false;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Referral() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getReferrer() { return referrer; }
    public void setReferrer(User referrer) { this.referrer = referrer; }

    public User getReferred() { return referred; }
    public void setReferred(User referred) { this.referred = referred; }

    public String getReferralCode() { return referralCode; }
    public void setReferralCode(String referralCode) { this.referralCode = referralCode; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public boolean isRewardPaid() { return rewardPaid; }
    public void setRewardPaid(boolean rewardPaid) { this.rewardPaid = rewardPaid; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
