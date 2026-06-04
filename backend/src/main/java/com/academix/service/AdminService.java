package com.academix.service;

import com.academix.dto.response.AnalyticsSummaryResponse;
import com.academix.dto.response.RevenueResponse;
import com.academix.enums.OrderStatus;
import com.academix.exception.ResourceNotFoundException;
import com.academix.model.Order;
import com.academix.model.User;
import com.academix.model.WriterProfile;
import com.academix.repository.OrderRepository;
import com.academix.repository.UserRepository;
import com.academix.repository.WriterProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final WriterProfileRepository writerProfileRepository;
    private final OrderRepository orderRepository;

    public AdminService(UserRepository userRepository,
                        WriterProfileRepository writerProfileRepository,
                        OrderRepository orderRepository) {
        this.userRepository = userRepository;
        this.writerProfileRepository = writerProfileRepository;
        this.orderRepository = orderRepository;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public List<WriterProfile> getPendingWriters() {
        return writerProfileRepository.findByIsVerifiedFalse();
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public AnalyticsSummaryResponse getGlobalAnalyticsSummary() {
        AnalyticsSummaryResponse summary = new AnalyticsSummaryResponse();

        summary.setTotalUsers(userRepository.count());
        summary.setTotalOrders(orderRepository.count());
        summary.setTotalRevenue(orderRepository.sumTotalRevenue());
        summary.setCommissionEarned(orderRepository.sumTotalCommission());
        summary.setActiveWriters(writerProfileRepository.countActiveVerifiedWriters());

        // Pending orders count
        long pendingCount = orderRepository.countByStatus(OrderStatus.PENDING);
        summary.setPendingOrdersCount(BigDecimal.valueOf(pendingCount));

        // Order status distribution map
        Map<String, Long> distribution = new HashMap<>();
        for (Object[] row : orderRepository.countGroupByStatus()) {
            String status = row[0].toString();
            Long count = ((Number) row[1]).longValue();
            distribution.put(status, count);
        }
        summary.setOrderStatusDistribution(distribution);

        return summary;
    }

    /**
     * Returns daily revenue for the last 30 days.
     * Days with no completed orders still appear with zero values (gap-fill logic).
     */
    public List<RevenueResponse> getPeriodicRevenueLogs() {
        LocalDateTime since = LocalDateTime.now().minusDays(30);
        List<Object[]> rows = orderRepository.getDailyRevenueSince(since);

        // Build a map of date -> RevenueResponse from DB rows
        Map<LocalDate, RevenueResponse> dataMap = new LinkedHashMap<>();
        for (Object[] row : rows) {
            LocalDate date = ((java.sql.Date) row[0]).toLocalDate();
            BigDecimal revenue    = row[1] != null ? new BigDecimal(row[1].toString()) : BigDecimal.ZERO;
            BigDecimal payout     = row[2] != null ? new BigDecimal(row[2].toString()) : BigDecimal.ZERO;
            BigDecimal profit     = row[3] != null ? new BigDecimal(row[3].toString()) : BigDecimal.ZERO;
            dataMap.put(date, new RevenueResponse(date, revenue, payout, profit));
        }

        // Gap-fill: ensure every day in the last 30 days appears (zeros for missing)
        List<RevenueResponse> logs = new ArrayList<>();
        LocalDate today = LocalDate.now();
        for (int i = 29; i >= 0; i--) {
            LocalDate day = today.minusDays(i);
            logs.add(dataMap.getOrDefault(day,
                    new RevenueResponse(day, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO)));
        }
        return logs;
    }

    @Transactional
    public void verifyWriterIdentity(Long writerId, String newStatus) {
        WriterProfile profile = writerProfileRepository.findById(writerId)
                .orElseThrow(() -> new ResourceNotFoundException("Writer profile not found"));
        boolean isVerified = "APPROVED".equalsIgnoreCase(newStatus)
                || "TRUE".equalsIgnoreCase(newStatus)
                || "VERIFIED".equalsIgnoreCase(newStatus);
        profile.setIsVerified(isVerified);
        writerProfileRepository.save(profile);
    }
}
