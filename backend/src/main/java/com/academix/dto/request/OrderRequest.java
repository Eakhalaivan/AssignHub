package com.academix.dto.request;

import com.academix.enums.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class OrderRequest {

    @NotBlank
    private String title;

    private String description;

    @Min(1)
    private Integer pages;

    @NotNull
    private Urgency urgency;

    @NotNull
    private WorkType workType;

    @NotNull
    private OrderType orderType;

    @Future
    private LocalDateTime deadline;

    private BigDecimal materialCost;

    private java.math.BigDecimal latitude;
    private java.math.BigDecimal longitude;
    private java.math.BigDecimal locationRadiusKm;
    private String subject;

    public OrderRequest() {}

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

    public LocalDateTime getDeadline() { return deadline; }
    public void setDeadline(LocalDateTime deadline) { this.deadline = deadline; }

    public BigDecimal getMaterialCost() { return materialCost; }
    public void setMaterialCost(BigDecimal materialCost) { this.materialCost = materialCost; }

    public java.math.BigDecimal getLatitude() { return latitude; }
    public void setLatitude(java.math.BigDecimal latitude) { this.latitude = latitude; }

    public java.math.BigDecimal getLongitude() { return longitude; }
    public void setLongitude(java.math.BigDecimal longitude) { this.longitude = longitude; }

    public java.math.BigDecimal getLocationRadiusKm() { return locationRadiusKm; }
    public void setLocationRadiusKm(java.math.BigDecimal locationRadiusKm) { this.locationRadiusKm = locationRadiusKm; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    private String fileUrls;
    public String getFileUrls() { return fileUrls; }
    public void setFileUrls(String fileUrls) { this.fileUrls = fileUrls; }

    private String academicLevel;
    private Integer diagramsCount;
    private String diagramComplexity;
    private Boolean colorDiagrams;
    private BigDecimal hardwareComponentsCost;
    private String modelType;
    private String printingType;
    private String bindingType;
    private String deliveryPriority;
    private BigDecimal deliveryCharge;
    private BigDecimal platformCommissionPercent;
    private String serviceType;

    public String getAcademicLevel() { return academicLevel; }
    public void setAcademicLevel(String academicLevel) { this.academicLevel = academicLevel; }

    public Integer getDiagramsCount() { return diagramsCount; }
    public void setDiagramsCount(Integer diagramsCount) { this.diagramsCount = diagramsCount; }

    public String getDiagramComplexity() { return diagramComplexity; }
    public void setDiagramComplexity(String diagramComplexity) { this.diagramComplexity = diagramComplexity; }

    public Boolean getColorDiagrams() { return colorDiagrams; }
    public void setColorDiagrams(Boolean colorDiagrams) { this.colorDiagrams = colorDiagrams; }

    public BigDecimal getHardwareComponentsCost() { return hardwareComponentsCost; }
    public void setHardwareComponentsCost(BigDecimal hardwareComponentsCost) { this.hardwareComponentsCost = hardwareComponentsCost; }

    public String getModelType() { return modelType; }
    public void setModelType(String modelType) { this.modelType = modelType; }

    public String getPrintingType() { return printingType; }
    public void setPrintingType(String printingType) { this.printingType = printingType; }

    public String getBindingType() { return bindingType; }
    public void setBindingType(String bindingType) { this.bindingType = bindingType; }

    public String getDeliveryPriority() { return deliveryPriority; }
    public void setDeliveryPriority(String deliveryPriority) { this.deliveryPriority = deliveryPriority; }

    public BigDecimal getDeliveryCharge() { return deliveryCharge; }
    public void setDeliveryCharge(BigDecimal deliveryCharge) { this.deliveryCharge = deliveryCharge; }

    public BigDecimal getPlatformCommissionPercent() { return platformCommissionPercent; }
    public void setPlatformCommissionPercent(BigDecimal platformCommissionPercent) { this.platformCommissionPercent = platformCommissionPercent; }

    public String getServiceType() { return serviceType; }
    public void setServiceType(String serviceType) { this.serviceType = serviceType; }
}
