package com.academix.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

@Service
public class TwilioSmsService {

    private static final Logger log = LoggerFactory.getLogger(TwilioSmsService.class);
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${twilio.account.sid:}")
    private String accountSid;

    @Value("${twilio.auth.token:}")
    private String authToken;

    @Value("${twilio.from.number:}")
    private String fromNumber;

    /**
     * Sends an SMS alert via the Twilio REST API.
     * If Twilio credentials are not configured, it logs the alert message for development.
     *
     * @param toPhoneNumber recipient phone number (with country code).
     * @param messageText   the body text.
     */
    public void sendSms(String toPhoneNumber, String messageText) {
        if (accountSid == null || accountSid.isBlank() || accountSid.startsWith("your") ||
            authToken == null || authToken.isBlank() || authToken.startsWith("your")) {
            log.info("[MOCK SMS ALERT] SMS target: {} | Content: {}", toPhoneNumber, messageText);
            return;
        }

        try {
            String url = "https://api.twilio.com/2010-04-01/Accounts/" + accountSid + "/Messages.json";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            headers.setBasicAuth(accountSid, authToken);

            MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
            map.add("To", toPhoneNumber);
            map.add("From", fromNumber);
            map.add("Body", messageText);

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(map, headers);
            String response = restTemplate.postForObject(url, request, String.class);
            log.info("Twilio SMS successfully processed: {}", response);
        } catch (Exception ex) {
            log.warn("Twilio SMS transmission failed ({}). Fallback logger trigger.", ex.getMessage());
            log.info("[FALLBACK SMS ALERT] SMS target: {} | Content: {}", toPhoneNumber, messageText);
        }
    }
}
