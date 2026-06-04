package com.academix.controller;

import com.academix.dto.response.ApiResponse;
import com.academix.exception.UnauthorizedException;
import com.academix.model.Notification;
import com.academix.model.User;
import com.academix.repository.UserRepository;
import com.academix.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    public NotificationController(NotificationService notificationService, UserRepository userRepository) {
        this.notificationService = notificationService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Notification>>> getNotifications(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        List<Notification> notifications = notificationService.getUserNotifications(user.getId());
        return ResponseEntity.ok(new ApiResponse<>(true, "Notifications synced", notifications));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(
            @PathVariable Long id) {
        notificationService.markNotificationAsRead(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Marked as read", null));
    }
}
