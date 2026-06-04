package com.academix.dto.request;

import java.util.List;

public class WriterProfileUpdateRequest {

    private String bio;
    private String degree;
    private String expertise;
    private Integer minDeadlineHours;
    private String city;
    private String country;
    private String languages;
    private List<String> availabilitySlots;

    public WriterProfileUpdateRequest() {}

    public WriterProfileUpdateRequest(String bio, String degree, String expertise, Integer minDeadlineHours,
                                     String city, String country, String languages, List<String> availabilitySlots) {
        this.bio = bio;
        this.degree = degree;
        this.expertise = expertise;
        this.minDeadlineHours = minDeadlineHours;
        this.city = city;
        this.country = country;
        this.languages = languages;
        this.availabilitySlots = availabilitySlots;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getDegree() {
        return degree;
    }

    public void setDegree(String degree) {
        this.degree = degree;
    }

    public String getExpertise() {
        return expertise;
    }

    public void setExpertise(String expertise) {
        this.expertise = expertise;
    }

    public Integer getMinDeadlineHours() {
        return minDeadlineHours;
    }

    public void setMinDeadlineHours(Integer minDeadlineHours) {
        this.minDeadlineHours = minDeadlineHours;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getLanguages() {
        return languages;
    }

    public void setLanguages(String languages) {
        this.languages = languages;
    }

    public List<String> getAvailabilitySlots() {
        return availabilitySlots;
    }

    public void setAvailabilitySlots(List<String> availabilitySlots) {
        this.availabilitySlots = availabilitySlots;
    }
}
