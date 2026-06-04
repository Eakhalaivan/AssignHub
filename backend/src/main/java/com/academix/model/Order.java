package com.academix.model;

import com.academix.enums.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "writer_id")
    private User writer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "college_id")
    private College college;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderType orderType;

    @Column(columnDefinition = "TEXT")
    private String description;

    private LocalDateTime deadline;
    
    private Integer pages;

    @Enumerated(EnumType.STRING)
    private Urgency urgency;

    @Enumerated(EnumType.STRING)
    private WorkType workType;

    @Enumerated(EnumType.STRING)
    private OrderStatus status;

    private BigDecimal totalCost;
    private BigDecimal materialCost;
    private BigDecimal writerEarning;
    private BigDecimal commission;

    @Column(columnDefinition = "TEXT")
    private String fileUrls;

    @Column(columnDefinition = "TEXT")
    private String completedFileUrls;

    @Column(columnDefinition = "TEXT")
    private String notes;

    private java.math.BigDecimal latitude;
    private java.math.BigDecimal longitude;

    @Column(name = "location_radius_km")
    private java.math.BigDecimal locationRadiusKm;

    private String subject;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private String title;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id")
    private Organization organization;

    public Order() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getStudent() { return student; }
    public void setStudent(User student) { this.student = student; }

    public User getWriter() { return writer; }
    public void setWriter(User writer) { this.writer = writer; }

    public College getCollege() { return college; }
    public void setCollege(College college) { this.college = college; }

    public OrderType getOrderType() { return orderType; }
    public void setOrderType(OrderType orderType) { this.orderType = orderType; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDateTime getDeadline() { return deadline; }
    public void setDeadline(LocalDateTime deadline) { this.deadline = deadline; }

    public Integer getPages() { return pages; }
    public void setPages(Integer pages) { this.pages = pages; }

    public Urgency getUrgency() { return urgency; }
    public void setUrgency(Urgency urgency) { this.urgency = urgency; }

    public WorkType getWorkType() { return workType; }
    public void setWorkType(WorkType workType) { this.workType = workType; }

    public OrderStatus getStatus() { return status; }
    public void setStatus(OrderStatus status) { this.status = status; }

    public BigDecimal getTotalCost() { return totalCost; }
    public void setTotalCost(BigDecimal totalCost) { this.totalCost = totalCost; }

    public BigDecimal getMaterialCost() { return materialCost; }
    public void setMaterialCost(BigDecimal materialCost) { this.materialCost = materialCost; }

    public BigDecimal getWriterEarning() { return writerEarning; }
    public void setWriterEarning(BigDecimal writerEarning) { this.writerEarning = writerEarning; }

    public BigDecimal getCommission() { return commission; }
    public void setCommission(BigDecimal commission) { this.commission = commission; }

    public String getFileUrls() { return fileUrls; }
    public void setFileUrls(String fileUrls) { this.fileUrls = fileUrls; }

    public String getCompletedFileUrls() { return completedFileUrls; }
    public void setCompletedFileUrls(String completedFileUrls) { this.completedFileUrls = completedFileUrls; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public java.math.BigDecimal getLatitude() { return latitude; }
    public void setLatitude(java.math.BigDecimal latitude) { this.latitude = latitude; }

    public java.math.BigDecimal getLongitude() { return longitude; }
    public void setLongitude(java.math.BigDecimal longitude) { this.longitude = longitude; }

    public java.math.BigDecimal getLocationRadiusKm() { return locationRadiusKm; }
    public void setLocationRadiusKm(java.math.BigDecimal locationRadiusKm) { this.locationRadiusKm = locationRadiusKm; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public Organization getOrganization() { return organization; }
    public void setOrganization(Organization organization) { this.organization = organization; }
}
