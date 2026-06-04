package com.academix.dto.response;

import com.academix.enums.AssignmentStatus;

public class AssignmentResponse {
    private Long id;
    private Long writerId;
    private String writerName;
    private Double writerRating;
    private Double distanceKm;
    private AssignmentStatus status;
    private String declineReason;

    public AssignmentResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getWriterId() { return writerId; }
    public void setWriterId(Long writerId) { this.writerId = writerId; }

    public String getWriterName() { return writerName; }
    public void setWriterName(String writerName) { this.writerName = writerName; }

    public Double getWriterRating() { return writerRating; }
    public void setWriterRating(Double writerRating) { this.writerRating = writerRating; }

    public Double getDistanceKm() { return distanceKm; }
    public void setDistanceKm(Double distanceKm) { this.distanceKm = distanceKm; }

    public AssignmentStatus getStatus() { return status; }
    public void setStatus(AssignmentStatus status) { this.status = status; }

    public String getDeclineReason() { return declineReason; }
    public void setDeclineReason(String declineReason) { this.declineReason = declineReason; }

    private String bio;
    private String degree;
    private java.util.List<String> specializations;
    private String initials;

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public String getDegree() { return degree; }
    public void setDegree(String degree) { this.degree = degree; }

    public java.util.List<String> getSpecializations() { return specializations; }
    public void setSpecializations(java.util.List<String> specializations) { this.specializations = specializations; }

    public String getInitials() { return initials; }
    public void setInitials(String initials) { this.initials = initials; }
}
