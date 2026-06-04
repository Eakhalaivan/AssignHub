package com.academix.repository;

import com.academix.model.LoginHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface LoginHistoryRepository extends JpaRepository<LoginHistory, Long> {
    List<LoginHistory> findByEmailOrderByCreatedAtDesc(String email);

    @Query("SELECT COUNT(lh) FROM LoginHistory lh WHERE lh.email = :email AND lh.success = false AND lh.createdAt > :since")
    long countFailedAttemptsSince(String email, LocalDateTime since);
}
