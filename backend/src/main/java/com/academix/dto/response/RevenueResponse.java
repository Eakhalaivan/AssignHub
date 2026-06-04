package com.academix.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;

public class RevenueResponse {

    private LocalDate date;
    private BigDecimal revenue;
    private BigDecimal writerPayout;
    private BigDecimal profit;

    public RevenueResponse() {}

    public RevenueResponse(LocalDate date, BigDecimal revenue, BigDecimal writerPayout, BigDecimal profit) {
        this.date = date;
        this.revenue = revenue;
        this.writerPayout = writerPayout;
        this.profit = profit;
    }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public BigDecimal getRevenue() { return revenue; }
    public void setRevenue(BigDecimal revenue) { this.revenue = revenue; }

    public BigDecimal getWriterPayout() { return writerPayout; }
    public void setWriterPayout(BigDecimal writerPayout) { this.writerPayout = writerPayout; }

    public BigDecimal getProfit() { return profit; }
    public void setProfit(BigDecimal profit) { this.profit = profit; }
}
