package com.academix.dto.request;

public class WriterProfileRequest {

    private String bio;
    private Boolean isAvailable;

    public WriterProfileRequest() {}

    public WriterProfileRequest(String bio, Boolean isAvailable) {
        this.bio = bio;
        this.isAvailable = isAvailable;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public Boolean getIsAvailable() {
        return isAvailable;
    }

    public void setIsAvailable(Boolean isAvailable) {
        this.isAvailable = isAvailable;
    }
}
