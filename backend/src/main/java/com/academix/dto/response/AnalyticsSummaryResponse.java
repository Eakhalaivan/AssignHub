package com.academix.dto.response;

import java.math.BigDecimal;
import java.util.Map;

public class AnalyticsSummaryResponse {

    private Long totalUsers;
    private Long totalOrders;
    private BigDecimal totalRevenue;
    private Long activeWriters;
    private BigDecimal pendingOrdersCount;
    private BigDecimal commissionEarned;
    private Map<String, Long> orderStatusDistribution;

    public AnalyticsSummaryResponse() {}

    public AnalyticsSummaryResponse(Long totalUsers, Long totalOrders, BigDecimal totalRevenue, Map<String, Long> orderStatusDistribution) {
        this.totalUsers = totalUsers;
        this.totalOrders = totalOrders;
        this.totalRevenue = totalRevenue;
        this.orderStatusDistribution = orderStatusDistribution;
        this.activeWriters = 0L;
        this.pendingOrdersCount = BigDecimal.ZERO;
        this.commissionEarned = BigDecimal.ZERO;
    }

    public Long getTotalUsers() { return totalUsers; }
    public void setTotalUsers(Long totalUsers) { this.totalUsers = totalUsers; }

    public Long getTotalOrders() { return totalOrders; }
    public void setTotalOrders(Long totalOrders) { this.totalOrders = totalOrders; }

    public BigDecimal getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(BigDecimal totalRevenue) { this.totalRevenue = totalRevenue; }

    public Long getActiveWriters() { return activeWriters; }
    public void setActiveWriters(Long activeWriters) { this.activeWriters = activeWriters; }

    public BigDecimal getPendingOrdersCount() { return pendingOrdersCount; }
    public void setPendingOrdersCount(BigDecimal pendingOrdersCount) { this.pendingOrdersCount = pendingOrdersCount; }

    public BigDecimal getCommissionEarned() { return commissionEarned; }
    public void setCommissionEarned(BigDecimal commissionEarned) { this.commissionEarned = commissionEarned; }

    public Map<String, Long> getOrderStatusDistribution() { return orderStatusDistribution; }
    public void setOrderStatusDistribution(Map<String, Long> orderStatusDistribution) { this.orderStatusDistribution = orderStatusDistribution; }
}
