package com.academix.dto.response;

import java.math.BigDecimal;

public class PricingResponse {

    private BigDecimal basePrice;
    private BigDecimal urgencyFee;
    private BigDecimal totalCost;

    public PricingResponse() {}

    public PricingResponse(BigDecimal basePrice, BigDecimal urgencyFee, BigDecimal totalCost) {
        this.basePrice = basePrice;
        this.urgencyFee = urgencyFee;
        this.totalCost = totalCost;
    }

    public BigDecimal getBasePrice() { return basePrice; }
    public void setBasePrice(BigDecimal basePrice) { this.basePrice = basePrice; }

    public BigDecimal getUrgencyFee() { return urgencyFee; }
    public void setUrgencyFee(BigDecimal urgencyFee) { this.urgencyFee = urgencyFee; }

    public BigDecimal getTotalCost() { return totalCost; }
    public void setTotalCost(BigDecimal totalCost) { this.totalCost = totalCost; }
}
