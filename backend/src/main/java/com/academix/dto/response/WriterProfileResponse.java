package com.academix.dto.response;

import java.math.BigDecimal;
import java.util.List;

public class WriterProfileResponse {

    private Long id;
    private String name;
    private String bio;
    private Boolean isAvailable;
    private Double rating;
    private String verificationStatus;
    
    private java.math.BigDecimal latitude;
    private java.math.BigDecimal longitude;
    private BigDecimal hourlyRateUsd;
    private String degree;
    private Integer minDeadlineHours;
    private Double distanceKm;
    private String initials;
    private List<String> specializations;

    public WriterProfileResponse() {}

    public WriterProfileResponse(Long id, String name, String bio, Boolean isAvailable, Double rating, String verificationStatus,
                                 java.math.BigDecimal latitude, java.math.BigDecimal longitude, BigDecimal hourlyRateUsd, String degree,
                                 Integer minDeadlineHours, Double distanceKm, String initials, List<String> specializations) {
        this.id = id;
        this.name = name;
        this.bio = bio;
        this.isAvailable = isAvailable;
        this.rating = rating;
        this.verificationStatus = verificationStatus;
        this.latitude = latitude;
        this.longitude = longitude;
        this.hourlyRateUsd = hourlyRateUsd;
        this.degree = degree;
        this.minDeadlineHours = minDeadlineHours;
        this.distanceKm = distanceKm;
        this.initials = initials;
        this.specializations = specializations;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public Boolean getIsAvailable() { return isAvailable; }
    public void setIsAvailable(Boolean isAvailable) { this.isAvailable = isAvailable; }

    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }

    public String getVerificationStatus() { return verificationStatus; }
    public void setVerificationStatus(String verificationStatus) { this.verificationStatus = verificationStatus; }

    public java.math.BigDecimal getLatitude() { return latitude; }
    public void setLatitude(java.math.BigDecimal latitude) { this.latitude = latitude; }

    public java.math.BigDecimal getLongitude() { return longitude; }
    public void setLongitude(java.math.BigDecimal longitude) { this.longitude = longitude; }

    public BigDecimal getHourlyRateUsd() { return hourlyRateUsd; }
    public void setHourlyRateUsd(BigDecimal hourlyRateUsd) { this.hourlyRateUsd = hourlyRateUsd; }

    public String getDegree() { return degree; }
    public void setDegree(String degree) { this.degree = degree; }

    public Integer getMinDeadlineHours() { return minDeadlineHours; }
    public void setMinDeadlineHours(Integer minDeadlineHours) { this.minDeadlineHours = minDeadlineHours; }

    public Double getDistanceKm() { return distanceKm; }
    public void setDistanceKm(Double distanceKm) { this.distanceKm = distanceKm; }

    public String getInitials() { return initials; }
    public void setInitials(String initials) { this.initials = initials; }

    public List<String> getSpecializations() { return specializations; }
    public void setSpecializations(List<String> specializations) { this.specializations = specializations; }
}
