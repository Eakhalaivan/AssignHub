package com.academix.controller;

import com.academix.dto.response.ApiResponse;
import com.academix.model.*;
import com.academix.repository.OrderRepository;
import com.academix.repository.UserRepository;
import com.academix.service.MessageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/conversations")
public class ChatController {

    private static final Logger log = LoggerFactory.getLogger(ChatController.class);

    private final MessageService messageService;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public ChatController(MessageService messageService,
                          OrderRepository orderRepository,
                          UserRepository userRepository,
                          SimpMessagingTemplate messagingTemplate) {
        this.messageService = messageService;
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @GetMapping("/{orderId}/messages")
    public ResponseEntity<ApiResponse<List<Message>>> getChatMessages(
            @PathVariable Long orderId,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        User currentUser = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new com.academix.exception.UnauthorizedException("User not found"));

        Order order = orderRepository.findById(orderId).orElse(null);
        if (order == null || order.getWriter() == null) {
            // If order doesn't exist or doesn't have a writer assigned yet, return an empty list
            return ResponseEntity.ok(new ApiResponse<>(true, "No messages yet", new ArrayList<>()));
        }

        // Validate that current user is either the student or the writer for this order
        boolean isStudent = order.getStudent().getId().equals(currentUser.getId());
        boolean isWriter = order.getWriter().getId().equals(currentUser.getId());
        if (!isStudent && !isWriter) {
            throw new com.academix.exception.UnauthorizedException("Access Denied");
        }

        Conversation conversation = messageService.getOrCreateConversation(
                order.getStudent().getId(),
                order.getWriter().getId(),
                order.getId()
        );

        List<Message> messages = messageService.getMessages(conversation.getId(), currentUser.getId(), 0, 100);
        return ResponseEntity.ok(new ApiResponse<>(true, "Messages loaded", messages));
    }

    @MessageMapping("/order/{orderId}/chat")
    public void handleChatMessage(@DestinationVariable Long orderId, Map<String, Object> payload) {
        log.info("Received WebSocket chat message for order {}: {}", orderId, payload);
        
        try {
            Long senderId = Long.valueOf(payload.get("senderId").toString());
            String content = (String) payload.get("content");

            Order order = orderRepository.findById(orderId).orElse(null);
            if (order == null || order.getWriter() == null) {
                log.warn("Cannot process chat: Order {} or writer is missing", orderId);
                return;
            }

            Conversation conversation = messageService.getOrCreateConversation(
                    order.getStudent().getId(),
                    order.getWriter().getId(),
                    order.getId()
            );

            Message saved = messageService.sendMessage(conversation.getId(), senderId, content, null);

            // Broadcast the saved message to the topic so both parties receive it
            String destination = "/topic/order/" + orderId + "/messages";
            messagingTemplate.convertAndSend(destination, saved);
            log.info("Broadcasted message #{} to destination {}", saved.getId(), destination);

        } catch (Exception e) {
            log.error("Failed to handle WebSocket message for order " + orderId, e);
        }
    }
}
