package com.academix.dto.response;

import com.academix.enums.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class OrderResponse {

    private Long id;
    private String title;
    private String description;
    private Integer pages;
    private Urgency urgency;
    private WorkType workType;
    private OrderType orderType;
    private OrderStatus status;
    private LocalDateTime deadline;
    private BigDecimal totalCost;
    private String fileUrl;
    private LocalDateTime createdAt;

    private java.math.BigDecimal latitude;
    private java.math.BigDecimal longitude;
    private java.math.BigDecimal locationRadiusKm;
    private String subject;
    
    private Long writerId;
    private String writerName;
    private Double writerRating;
    private Double distanceKm;
    private Long organizationId;
    private String organizationName;

    public OrderResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getPages() { return pages; }
    public void setPages(Integer pages) { this.pages = pages; }

    public Urgency getUrgency() { return urgency; }
    public void setUrgency(Urgency urgency) { this.urgency = urgency; }

    public WorkType getWorkType() { return workType; }
    public void setWorkType(WorkType workType) { this.workType = workType; }

    public OrderType getOrderType() { return orderType; }
    public void setOrderType(OrderType orderType) { this.orderType = orderType; }

    public OrderStatus getStatus() { return status; }
    public void setStatus(OrderStatus status) { this.status = status; }

    public LocalDateTime getDeadline() { return deadline; }
    public void setDeadline(LocalDateTime deadline) { this.deadline = deadline; }

    public BigDecimal getTotalCost() { return totalCost; }
    public void setTotalCost(BigDecimal totalCost) { this.totalCost = totalCost; }

    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public java.math.BigDecimal getLatitude() { return latitude; }
    public void setLatitude(java.math.BigDecimal latitude) { this.latitude = latitude; }

    public java.math.BigDecimal getLongitude() { return longitude; }
    public void setLongitude(java.math.BigDecimal longitude) { this.longitude = longitude; }

    public java.math.BigDecimal getLocationRadiusKm() { return locationRadiusKm; }
    public void setLocationRadiusKm(java.math.BigDecimal locationRadiusKm) { this.locationRadiusKm = locationRadiusKm; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public Long getWriterId() { return writerId; }
    public void setWriterId(Long writerId) { this.writerId = writerId; }

    public String getWriterName() { return writerName; }
    public void setWriterName(String writerName) { this.writerName = writerName; }

    public Double getWriterRating() { return writerRating; }
    public void setWriterRating(Double writerRating) { this.writerRating = writerRating; }

    public Double getDistanceKm() { return distanceKm; }
    public void setDistanceKm(Double distanceKm) { this.distanceKm = distanceKm; }

    public Long getOrganizationId() { return organizationId; }
    public void setOrganizationId(Long organizationId) { this.organizationId = organizationId; }

    public String getOrganizationName() { return organizationName; }
    public void setOrganizationName(String organizationName) { this.organizationName = organizationName; }

    private java.util.List<AssignmentResponse> matchedWriters;
    public java.util.List<AssignmentResponse> getMatchedWriters() { return matchedWriters; }
    public void setMatchedWriters(java.util.List<AssignmentResponse> matchedWriters) { this.matchedWriters = matchedWriters; }
}
