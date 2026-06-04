package com.academix.repository;

import com.academix.model.DeviceSession;
import com.academix.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeviceSessionRepository extends JpaRepository<DeviceSession, Long> {
    Optional<DeviceSession> findBySessionId(String sessionId);
    List<DeviceSession> findByUserId(Long userId);

    @Modifying
    @Query("DELETE FROM DeviceSession ds WHERE ds.user = :user")
    void deleteByUser(User user);
    
    void deleteBySessionId(String sessionId);
}
