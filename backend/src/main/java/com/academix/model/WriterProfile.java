package com.academix.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "writer_profiles")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class WriterProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(columnDefinition = "TEXT")
    private String expertise;

    @Column(columnDefinition = "TEXT")
    private String nearbyColleges;

    private BigDecimal rating;
    
    private Integer totalRatings;

    private Boolean availability;

    @Column(name = "is_verified")
    private Boolean isVerified;

    @Enumerated(EnumType.STRING)
    @Column(name = "tier", nullable = false)
    private com.academix.enums.WriterTier tier = com.academix.enums.WriterTier.BRONZE;

    private BigDecimal walletBalance;

    @Column(columnDefinition = "TEXT")
    private String sampleWorkUrls;

    @Column(columnDefinition = "TEXT")
    private String bio;

    private java.math.BigDecimal latitude;
    private java.math.BigDecimal longitude;

    @Column(name = "hourly_rate_usd")
    private java.math.BigDecimal hourlyRateUsd;

    private String degree;

    @Column(name = "min_deadline_hours")
    private Integer minDeadlineHours;

    public WriterProfile() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getExpertise() { return expertise; }
    public void setExpertise(String expertise) { this.expertise = expertise; }

    public String getNearbyColleges() { return nearbyColleges; }
    public void setNearbyColleges(String nearbyColleges) { this.nearbyColleges = nearbyColleges; }

    public BigDecimal getRating() { return rating; }
    public void setRating(BigDecimal rating) { this.rating = rating; }

    public Integer getTotalRatings() { return totalRatings; }
    public void setTotalRatings(Integer totalRatings) { this.totalRatings = totalRatings; }

    public Boolean getAvailability() { return availability; }
    public void setAvailability(Boolean availability) { this.availability = availability; }

    public Boolean getIsVerified() { return isVerified; }
    public void setIsVerified(Boolean isVerified) { this.isVerified = isVerified; }

    public BigDecimal getWalletBalance() { return walletBalance; }
    public void setWalletBalance(BigDecimal walletBalance) { this.walletBalance = walletBalance; }

    public String getSampleWorkUrls() { return sampleWorkUrls; }
    public void setSampleWorkUrls(String sampleWorkUrls) { this.sampleWorkUrls = sampleWorkUrls; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public java.math.BigDecimal getLatitude() { return latitude; }
    public void setLatitude(java.math.BigDecimal latitude) { this.latitude = latitude; }

    public java.math.BigDecimal getLongitude() { return longitude; }
    public void setLongitude(java.math.BigDecimal longitude) { this.longitude = longitude; }

    public java.math.BigDecimal getHourlyRateUsd() { return hourlyRateUsd; }
    public void setHourlyRateUsd(java.math.BigDecimal hourlyRateUsd) { this.hourlyRateUsd = hourlyRateUsd; }

    public String getDegree() { return degree; }
    public void setDegree(String degree) { this.degree = degree; }

    public Integer getMinDeadlineHours() { return minDeadlineHours; }
    public void setMinDeadlineHours(Integer minDeadlineHours) { this.minDeadlineHours = minDeadlineHours; }

    public com.academix.enums.WriterTier getTier() { return tier; }
    public void setTier(com.academix.enums.WriterTier tier) { this.tier = tier; }
}
