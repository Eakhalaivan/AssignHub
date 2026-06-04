package com.academix.repository;

import com.academix.enums.OrderStatus;
import com.academix.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByStudentId(Long studentId);
    List<Order> findByStatus(OrderStatus status);

    // Count by status
    @Query("SELECT COUNT(o) FROM Order o WHERE o.status = :status")
    long countByStatus(@Param("status") OrderStatus status);

    // Sum total revenue from completed/delivered orders
    @Query("SELECT COALESCE(SUM(o.totalCost), 0) FROM Order o WHERE o.status IN (com.academix.enums.OrderStatus.COMPLETED, com.academix.enums.OrderStatus.DELIVERED)")
    BigDecimal sumTotalRevenue();

    // Sum commission from completed/delivered orders
    @Query("SELECT COALESCE(SUM(o.commission), 0) FROM Order o WHERE o.status IN (com.academix.enums.OrderStatus.COMPLETED, com.academix.enums.OrderStatus.DELIVERED)")
    BigDecimal sumTotalCommission();

    // Sum writer payouts from completed/delivered orders
    @Query("SELECT COALESCE(SUM(o.writerEarning), 0) FROM Order o WHERE o.status IN (com.academix.enums.OrderStatus.COMPLETED, com.academix.enums.OrderStatus.DELIVERED)")
    BigDecimal sumWriterPayouts();

    // Daily revenue aggregation for the last N days (native query)
    @Query(value = """
        SELECT
            DATE(o.created_at)       AS date,
            COALESCE(SUM(o.total_cost), 0)      AS revenue,
            COALESCE(SUM(o.writer_earning), 0)  AS writerPayout,
            COALESCE(SUM(o.commission), 0)      AS profit
        FROM orders o
        WHERE o.status IN ('COMPLETED', 'DELIVERED')
          AND o.created_at >= :since
        GROUP BY DATE(o.created_at)
        ORDER BY DATE(o.created_at) ASC
        """, nativeQuery = true)
    List<Object[]> getDailyRevenueSince(@Param("since") LocalDateTime since);

    // Status distribution
    @Query("SELECT o.status, COUNT(o) FROM Order o GROUP BY o.status")
    List<Object[]> countGroupByStatus();

    @Query("SELECT COUNT(o) FROM Order o WHERE o.student.id = :studentId AND o.status IN (com.academix.enums.OrderStatus.PENDING, com.academix.enums.OrderStatus.ASSIGNED, com.academix.enums.OrderStatus.IN_PROGRESS)")
    long countActiveByStudentId(@Param("studentId") Long studentId);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.student.id = :studentId AND o.status = com.academix.enums.OrderStatus.COMPLETED")
    long countCompletedByStudentId(@Param("studentId") Long studentId);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.student.id = :studentId AND o.status = com.academix.enums.OrderStatus.CANCELLED")
    long countCancelledByStudentId(@Param("studentId") Long studentId);

    @Query("SELECT COALESCE(SUM(o.totalCost), 0) FROM Order o WHERE o.student.id = :studentId AND o.status IN (com.academix.enums.OrderStatus.COMPLETED, com.academix.enums.OrderStatus.DELIVERED)")
    BigDecimal sumSpentByStudentId(@Param("studentId") Long studentId);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.student.id = :studentId")
    long countByStudentId(@Param("studentId") Long studentId);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.student.id = :studentId AND o.status = :status")
    long countByStudentIdAndStatus(@Param("studentId") Long studentId, @Param("status") OrderStatus status);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.student.id = :studentId AND o.createdAt >= :after")
    long countByStudentIdAndCreatedAtAfter(@Param("studentId") Long studentId, @Param("after") LocalDateTime after);

    @Query("SELECT COUNT(o) FROM Order o JOIN o.student u WHERE u.organization.id = :orgId AND o.createdAt >= :after")
    long countByOrganizationIdAndCreatedAtAfter(@Param("orgId") Long orgId, @Param("after") LocalDateTime after);
}
