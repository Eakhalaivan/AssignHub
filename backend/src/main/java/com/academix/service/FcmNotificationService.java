package com.academix.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class FcmNotificationService {

    private static final Logger log = LoggerFactory.getLogger(FcmNotificationService.class);

    @Value("${fcm.server.key:}")
    private String fcmServerKey;

    /**
     * Sends a mobile push notification using Firebase Cloud Messaging (FCM).
     * Since FCM requires a service account JSON, we log and stub this locally.
     *
     * @param fcmToken recipient device registration token.
     * @param title    notification title.
     * @param body     notification body content.
     */
    public void sendPushNotification(String fcmToken, String title, String body) {
        if (fcmToken == null || fcmToken.isBlank()) {
            return;
        }
        log.info("[MOCK FCM PUSH] Sending to token: {} | Title: {} | Body: {}", fcmToken, title, body);
    }
}
