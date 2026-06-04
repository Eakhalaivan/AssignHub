package com.academix.service;

import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    public EmailService(@Autowired(required = false) JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /**
     * Sends an HTML-formatted email.
     * Falls back to logging if the MailSender is not configured or disabled.
     *
     * @param to          recipient email.
     * @param subject     email subject line.
     * @param htmlContent HTML body.
     */
    public void sendHtmlEmail(String to, String subject, String htmlContent) {
        if (mailSender == null || fromEmail == null || fromEmail.isBlank() || fromEmail.startsWith("your")) {
            log.info("[MOCK EMAIL] To: {} | Subject: {} | Content:\n{}", to, subject, htmlContent);
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Email sent successfully to {}", to);
        } catch (Exception ex) {
            log.warn("SMTP email transmission failed to {} ({}). Logger fallback applied.", to, ex.getMessage());
            log.info("[FALLBACK EMAIL] To: {} | Subject: {} | Content:\n{}", to, subject, htmlContent);
        }
    }
}
