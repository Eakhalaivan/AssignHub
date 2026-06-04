package com.academix.repository;

import com.academix.model.Dispute;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DisputeRepository extends JpaRepository<Dispute, Long> {
    List<Dispute> findByOrderId(Long orderId);
    List<Dispute> findByCreatorId(Long creatorId);
    List<Dispute> findByHandlerId(Long handlerId);
}
