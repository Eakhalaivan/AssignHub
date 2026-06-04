package com.academix.repository;

import com.academix.model.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {
    @Query("SELECT c FROM Conversation c WHERE c.student.id = :userId OR c.writer.id = :userId")
    List<Conversation> findActiveConversationsForUser(Long userId);

    @Query("SELECT c FROM Conversation c WHERE c.student.id = :studentId AND c.writer.id = :writerId")
    Optional<Conversation> findConversationBetween(Long studentId, Long writerId);
}
