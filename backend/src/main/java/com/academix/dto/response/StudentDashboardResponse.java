package com.academix.dto.response;

import java.math.BigDecimal;
import java.util.Map;

public class StudentDashboardResponse {

    private Long totalOrders;
    private Long activeOrders;       // PENDING + ASSIGNED + IN_PROGRESS
    private Long completedOrders;
    private Long cancelledOrders;
    private BigDecimal totalSpent;
    private String name;
    private String email;
    private String department;
    private Integer year;
    private String collegeName;
    private Map<String, Long> orderStatusBreakdown;

    public StudentDashboardResponse() {}

    public Long getTotalOrders() {
        return totalOrders;
    }

    public void setTotalOrders(Long totalOrders) {
        this.totalOrders = totalOrders;
    }

    public Long getActiveOrders() {
        return activeOrders;
    }

    public void setActiveOrders(Long activeOrders) {
        this.activeOrders = activeOrders;
    }

    public Long getCompletedOrders() {
        return completedOrders;
    }

    public void setCompletedOrders(Long completedOrders) {
        this.completedOrders = completedOrders;
    }

    public Long getCancelledOrders() {
        return cancelledOrders;
    }

    public void setCancelledOrders(Long cancelledOrders) {
        this.cancelledOrders = cancelledOrders;
    }

    public BigDecimal getTotalSpent() {
        return totalSpent;
    }

    public void setTotalSpent(BigDecimal totalSpent) {
        this.totalSpent = totalSpent;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public Integer getYear() {
        return year;
    }

    public void setYear(Integer year) {
        this.year = year;
    }

    public String getCollegeName() {
        return collegeName;
    }

    public void setCollegeName(String collegeName) {
        this.collegeName = collegeName;
    }

    public Map<String, Long> getOrderStatusBreakdown() {
        return orderStatusBreakdown;
    }

    public void setOrderStatusBreakdown(Map<String, Long> orderStatusBreakdown) {
        this.orderStatusBreakdown = orderStatusBreakdown;
    }
}
