package com.academix.dto.response;

import java.math.BigDecimal;

public class EarningsResponse {

    private BigDecimal walletBalance;
    private BigDecimal totalEarned;
    private Integer completedTasksCount;

    public EarningsResponse() {}

    public EarningsResponse(BigDecimal walletBalance, BigDecimal totalEarned, Integer completedTasksCount) {
        this.walletBalance = walletBalance;
        this.totalEarned = totalEarned;
        this.completedTasksCount = completedTasksCount;
    }

    public BigDecimal getWalletBalance() {
        return walletBalance;
    }

    public void setWalletBalance(BigDecimal walletBalance) {
        this.walletBalance = walletBalance;
    }

    public BigDecimal getTotalEarned() {
        return totalEarned;
    }

    public void setTotalEarned(BigDecimal totalEarned) {
        this.totalEarned = totalEarned;
    }

    public Integer getCompletedTasksCount() {
        return completedTasksCount;
    }

    public void setCompletedTasksCount(Integer completedTasksCount) {
        this.completedTasksCount = completedTasksCount;
    }
}
