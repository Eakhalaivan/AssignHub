package com.academix.service;

import com.academix.exception.BadRequestException;
import com.academix.exception.ResourceNotFoundException;
import com.academix.model.Conversation;
import com.academix.model.Message;
import com.academix.model.User;
import com.academix.repository.ConversationRepository;
import com.academix.repository.MessageRepository;
import com.academix.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class MessageService {

    private static final Logger log = LoggerFactory.getLogger(MessageService.class);

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public MessageService(ConversationRepository conversationRepository,
                          MessageRepository messageRepository,
                          UserRepository userRepository,
                          SimpMessagingTemplate messagingTemplate) {
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @Transactional
    public Conversation getOrCreateConversation(Long studentId, Long writerId, Long orderId) {
        Optional<Conversation> existing = conversationRepository.findConversationBetween(studentId, writerId);
        if (existing.isPresent()) {
            return existing.get();
        }

        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found: " + studentId));
        User writer = userRepository.findById(writerId)
                .orElseThrow(() -> new ResourceNotFoundException("Writer not found: " + writerId));

        Conversation conversation = new Conversation();
        conversation.setStudent(student);
        conversation.setWriter(writer);
        conversation.setCreatedAt(LocalDateTime.now());
        
        Conversation saved = conversationRepository.save(conversation);
        log.info("Created new Conversation #{} matching Student {} and Writer {}", saved.getId(), studentId, writerId);
        return saved;
    }

    @Transactional
    public Message sendMessage(Long conversationId, Long senderId, String content, String attachmentUrl) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found: " + conversationId));

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new ResourceNotFoundException("Sender not found: " + senderId));

        // Enforce participant authorization
        boolean isStudent = conversation.getStudent().getId().equals(senderId);
        boolean isWriter = conversation.getWriter().getId().equals(senderId);
        if (!isStudent && !isWriter) {
            throw new BadRequestException("Unauthorized participant in message dispatch.");
        }

        Message msg = new Message();
        msg.setConversation(conversation);
        msg.setSender(sender);
        msg.setContent(content);
        msg.setAttachmentUrl(attachmentUrl);
        msg.setRead(false);
        msg.setCreatedAt(LocalDateTime.now());

        Message saved = messageRepository.save(msg);

        // Push real-time alert via Stomp Broker to receiver
        User recipient = isStudent ? conversation.getWriter() : conversation.getStudent();
        try {
            messagingTemplate.convertAndSendToUser(
                    recipient.getEmail(),
                    "/queue/messages",
                    saved
            );
            log.info("Dispatched live message #{} to user {}", saved.getId(), recipient.getEmail());
        } catch (Exception ex) {
            log.warn("WebSocket publish failed. Client will pull on reload. ({})", ex.getMessage());
        }

        return saved;
    }

    @Transactional
    public void markConversationAsRead(Long conversationId, Long userId) {
        messageRepository.markAsRead(conversationId, userId);
        log.debug("Marked all messages under Conversation #{} read by User {}", conversationId, userId);
    }

    @Transactional(readOnly = true)
    public List<Message> getMessages(Long conversationId, Long userId, int page, int size) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found: " + conversationId));

        if (!conversation.getStudent().getId().equals(userId) && !conversation.getWriter().getId().equals(userId)) {
            throw new BadRequestException("Unauthorized access to messages list.");
        }

        Pageable pageable = PageRequest.of(page, size);
        return messageRepository.findByConversationIdOrderByCreatedAtDesc(conversationId, pageable);
    }
}
