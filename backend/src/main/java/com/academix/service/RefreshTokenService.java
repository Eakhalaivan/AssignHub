package com.academix.service;

import com.academix.exception.UnauthorizedException;
import com.academix.model.RefreshToken;
import com.academix.model.User;
import com.academix.repository.RefreshTokenRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.UUID;

@Service
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;

    @Value("${jwt.refresh-expiration}")
    private long refreshExpirationMs;

    public RefreshTokenService(RefreshTokenRepository refreshTokenRepository) {
        this.refreshTokenRepository = refreshTokenRepository;
    }

    @Transactional
    public String createRefreshToken(User user, String ipAddress, String deviceInfo) {
        // Option to revoke previous tokens for strict single-session, but we allow multi-device here unless specified
        // refreshTokenRepository.revokeAllUserTokens(user);

        String token = UUID.randomUUID().toString();
        String tokenHash = hashToken(token);

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(user);
        refreshToken.setTokenHash(tokenHash);
        refreshToken.setExpiresAt(LocalDateTime.now().plusNanos(refreshExpirationMs * 1_000_000));
        refreshToken.setIpAddress(ipAddress);
        refreshToken.setDeviceInfo(deviceInfo);
        
        refreshTokenRepository.save(refreshToken);

        return token;
    }

    @Transactional
    public RefreshToken verifyExpirationAndRevocation(String token) {
        String tokenHash = hashToken(token);
        RefreshToken refreshToken = refreshTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new UnauthorizedException("Invalid refresh token. Please login again."));

        if (refreshToken.isRevoked()) {
            // Token reuse detected (family of tokens compromised) -> optionally revoke all tokens for user
            refreshTokenRepository.revokeAllUserTokens(refreshToken.getUser());
            throw new UnauthorizedException("Session compromised. Please login again.");
        }

        if (refreshToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            refreshTokenRepository.delete(refreshToken);
            throw new UnauthorizedException("Refresh token has expired. Please login again.");
        }

        return refreshToken;
    }

    @Transactional
    public String rotateRefreshToken(String oldToken, String ipAddress, String deviceInfo) {
        RefreshToken oldRefreshToken = verifyExpirationAndRevocation(oldToken);
        
        // Revoke the old token
        oldRefreshToken.setRevoked(true);
        refreshTokenRepository.save(oldRefreshToken);

        // Issue a new token
        return createRefreshToken(oldRefreshToken.getUser(), ipAddress, deviceInfo);
    }

    @Transactional
    public void revokeRefreshToken(String token) {
        String tokenHash = hashToken(token);
        refreshTokenRepository.findByTokenHash(tokenHash).ifPresent(refreshToken -> {
            refreshToken.setRevoked(true);
            refreshTokenRepository.save(refreshToken);
        });
    }

    @Transactional
    public void revokeAllUserTokens(User user) {
        refreshTokenRepository.revokeAllUserTokens(user);
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] encodedHash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(encodedHash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Could not hash token", e);
        }
    }
}
