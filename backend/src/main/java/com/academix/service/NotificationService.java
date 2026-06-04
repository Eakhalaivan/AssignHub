package com.academix.service;

import com.academix.model.Notification;
import com.academix.model.User;
import com.academix.repository.NotificationRepository;
import com.academix.repository.UserRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final EmailService emailService;
    private final TwilioSmsService twilioSmsService;
    private final FcmNotificationService fcmNotificationService;

    public NotificationService(NotificationRepository notificationRepository,
                               UserRepository userRepository,
                               SimpMessagingTemplate messagingTemplate,
                               EmailService emailService,
                               TwilioSmsService twilioSmsService,
                               FcmNotificationService fcmNotificationService) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.messagingTemplate = messagingTemplate;
        this.emailService = emailService;
        this.twilioSmsService = twilioSmsService;
        this.fcmNotificationService = fcmNotificationService;
    }

    /**
     * Dispatch a notification to a specific user across multiple channels:
     * 1. Save to Database for persistence.
     * 2. Broadcast via STOMP WebSocket for real-time UI updates.
     * 3. Send HTML email notification.
     * 4. Dispatch SMS notification.
     * 5. Dispatch FCM Mobile Web Push alert.
     *
     * @param userId  recipient User identifier.
     * @param message the body text of the message.
     */
    public void sendNotificationToUser(Long userId, String message) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return;

        Notification notification = new Notification();
        notification.setUser(user);
        notification.setTitle(user.getRole().name() + " Update");
        notification.setMessage(message);
        notification.setType("SYSTEM");
        notification.setIsRead(false);
        notification.setCreatedAt(LocalDateTime.now());
        
        Notification saved = notificationRepository.save(notification);

        // 1. Broadcast over STOMP WebSocket
        try {
            messagingTemplate.convertAndSendToUser(
                    user.getEmail(),
                    "/queue/notifications",
                    saved
            );
        } catch (Exception e) {
            // Suppress error so that WebSocket issues do not fail transactions
        }

        // 2. Dispatch HTML Email
        String emailHtml = "<html><body>" +
                "<h2>ACADEMIX Platform Update</h2>" +
                "<p>Hello " + user.getName() + ",</p>" +
                "<p>" + message + "</p>" +
                "<br/><p>Best Regards,<br/>ACADEMIX Team</p>" +
                "</body></html>";
        emailService.sendHtmlEmail(user.getEmail(), "ACADEMIX: " + saved.getTitle(), emailHtml);

        // 3. Dispatch SMS (if phone number is configured)
        if (user.getPhone() != null && !user.getPhone().isBlank()) {
            twilioSmsService.sendSms(user.getPhone(), "ACADEMIX: " + message);
        }

        // 4. Dispatch FCM Push
        fcmNotificationService.sendPushNotification("mock_token_" + user.getId(), saved.getTitle(), message);
    }

    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public void markNotificationAsRead(Long notificationId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            n.setIsRead(true);
            notificationRepository.save(n);
        });
    }
}
