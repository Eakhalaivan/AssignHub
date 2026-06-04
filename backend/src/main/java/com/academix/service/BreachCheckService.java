package com.academix.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;

@Service
public class BreachCheckService {

    private static final Logger log = LoggerFactory.getLogger(BreachCheckService.class);
    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Checks if a password has been leaked in a public data breach using the HaveIBeenPwned API.
     * Uses k-Anonymity: sends only the first 5 characters of the SHA-1 hash to the API.
     * If the API is offline or rate-limited, it falls back to permitting the password.
     */
    public boolean isPasswordBreached(String password) {
        if (password == null || password.isBlank()) {
            return false;
        }
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-1");
            byte[] hashBytes = digest.digest(password.getBytes());
            String sha1Hex = HexFormat.of().withUpperCase().formatHex(hashBytes);

            String prefix = sha1Hex.substring(0, 5);
            String suffix = sha1Hex.substring(5);

            String url = "https://api.pwnedpasswords.com/range/" + prefix;
            String response = restTemplate.getForObject(url, String.class);

            if (response == null) {
                return false;
            }

            for (String line : response.split("\r?\n")) {
                String[] parts = line.split(":");
                if (parts.length > 0 && parts[0].equalsIgnoreCase(suffix)) {
                    int count = Integer.parseInt(parts[1].trim());
                    log.warn("Password check triggered: password has been leaked in {} public breaches.", count);
                    return true;
                }
            }
            return false;
        } catch (NoSuchAlgorithmException e) {
            log.error("SHA-1 algorithm not found", e);
            return false;
        } catch (Exception e) {
            log.warn("HaveIBeenPwned API breach check is offline or failed ({}). Proceeding with registration.", e.getMessage());
            return false;
        }
    }
}
