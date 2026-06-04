package com.academix.repository;

import com.academix.enums.AssignmentStatus;
import com.academix.enums.OrderStatus;
import com.academix.model.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
    List<Assignment> findByWriterId(Long writerId);
    List<Assignment> findByWriterIdAndOrderStatus(Long writerId, OrderStatus status);
    List<Assignment> findByOrderId(Long orderId);
    boolean existsByOrderIdAndStatusIn(Long orderId, Collection<AssignmentStatus> statuses);
    List<Assignment> findByWriterIdAndStatusIn(Long writerId, Collection<AssignmentStatus> statuses);
}
