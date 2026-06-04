package com.academix.controller;

import com.academix.dto.request.*;
import com.academix.dto.response.ApiResponse;
import com.academix.dto.response.AuthResponse;
import com.academix.dto.response.DeviceSessionResponse;
import com.academix.dto.response.UserResponse;
import com.academix.model.User;
import com.academix.service.AuthService;
import com.academix.security.JwtTokenProvider;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;
    private final JwtTokenProvider tokenProvider;

    public AuthController(AuthService authService, JwtTokenProvider tokenProvider) {
        this.authService = authService;
        this.tokenProvider = tokenProvider;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Registration successful", response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Login successful", response));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        AuthResponse response = authService.refreshToken(request.getRefreshToken());
        return ResponseEntity.ok(new ApiResponse<>(true, "Tokens refreshed", response));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<?>> logout(@Valid @RequestBody RefreshTokenRequest request) {
        authService.logout(request.getRefreshToken());
        return ResponseEntity.ok(new ApiResponse<>(true, "Logged out successfully", null));
    }

    @PostMapping("/logout-all")
    public ResponseEntity<ApiResponse<?>> logoutAll(Authentication authentication) {
        User user = authService.getUserByEmail(authentication.getName());
        authService.logoutAll(user);
        return ResponseEntity.ok(new ApiResponse<>(true, "Logged out of all devices successfully", null));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<?>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ResponseEntity.ok(new ApiResponse<>(true, "If the email is registered, a password reset link has been dispatched.", null));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<?>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Password has been successfully updated.", null));
    }

    @PostMapping("/verify-email")
    public ResponseEntity<ApiResponse<?>> verifyEmail(@Valid @RequestBody VerifyEmailRequest request) {
        authService.verifyEmail(request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Email has been successfully verified.", null));
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<ApiResponse<?>> resendVerification(@RequestParam String email) {
        authService.resendVerification(email);
        return ResponseEntity.ok(new ApiResponse<>(true, "Verification token resent successfully.", null));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> me(Authentication authentication) {
        User user = authService.getUserByEmail(authentication.getName());
        return ResponseEntity.ok(new ApiResponse<>(true, "Current profile retrieved", authService.mapToUserResponse(user)));
    }

    @GetMapping("/sessions")
    public ResponseEntity<ApiResponse<List<DeviceSessionResponse>>> sessions(Authentication authentication, HttpServletRequest request) {
        User user = authService.getUserByEmail(authentication.getName());
        
        // Extract session ID from active token
        String bearerToken = request.getHeader("Authorization");
        String currentSessionId = null;
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            String jwt = bearerToken.substring(7);
            currentSessionId = tokenProvider.getSessionIdFromJWT(jwt);
        }

        List<DeviceSessionResponse> sessions = authService.getActiveSessions(user, currentSessionId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Active device sessions loaded", sessions));
    }

    @DeleteMapping("/sessions/{sessionId}")
    public ResponseEntity<ApiResponse<?>> revokeSession(Authentication authentication, @PathVariable String sessionId) {
        User user = authService.getUserByEmail(authentication.getName());
        authService.revokeSession(user, sessionId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Device session revoked successfully", null));
    }
}
