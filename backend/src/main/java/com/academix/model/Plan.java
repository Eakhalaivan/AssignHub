package com.academix.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "plans")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Plan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(name = "monthly_order_limit", nullable = false)
    private Integer monthlyOrderLimit;

    @Column(name = "priority_matching", nullable = false)
    private Boolean priorityMatching = false;

    @Column(name = "advanced_analytics", nullable = false)
    private Boolean advancedAnalytics = false;

    @Column(name = "price_monthly", nullable = false)
    private BigDecimal priceMonthly;

    @Column(name = "price_yearly", nullable = false)
    private BigDecimal priceYearly;

    @Column(name = "max_seats", nullable = false)
    private Integer maxSeats = 5;

    private LocalDateTime createdAt;

    public Plan() {}

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Integer getMonthlyOrderLimit() { return monthlyOrderLimit; }
    public void setMonthlyOrderLimit(Integer monthlyOrderLimit) { this.monthlyOrderLimit = monthlyOrderLimit; }

    public Boolean getPriorityMatching() { return priorityMatching; }
    public void setPriorityMatching(Boolean priorityMatching) { this.priorityMatching = priorityMatching; }

    public Boolean getAdvancedAnalytics() { return advancedAnalytics; }
    public void setAdvancedAnalytics(Boolean advancedAnalytics) { this.advancedAnalytics = advancedAnalytics; }

    public BigDecimal getPriceMonthly() { return priceMonthly; }
    public void setPriceMonthly(BigDecimal priceMonthly) { this.priceMonthly = priceMonthly; }

    public BigDecimal getPriceYearly() { return priceYearly; }
    public void setPriceYearly(BigDecimal priceYearly) { this.priceYearly = priceYearly; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public Integer getMaxSeats() { return maxSeats; }
    public void setMaxSeats(Integer maxSeats) { this.maxSeats = maxSeats; }
}
