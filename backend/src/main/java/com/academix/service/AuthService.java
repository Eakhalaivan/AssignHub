package com.academix.service;

import com.academix.dto.request.ForgotPasswordRequest;
import com.academix.dto.request.LoginRequest;
import com.academix.dto.request.RegisterRequest;
import com.academix.dto.request.ResetPasswordRequest;
import com.academix.dto.request.VerifyEmailRequest;
import com.academix.dto.response.AuthResponse;
import com.academix.dto.response.DeviceSessionResponse;
import com.academix.dto.response.UserResponse;
import com.academix.enums.Role;
import com.academix.enums.UserStatus;
import com.academix.exception.BadRequestException;
import com.academix.exception.ResourceNotFoundException;
import com.academix.exception.UnauthorizedException;
import com.academix.model.*;
import com.academix.repository.*;
import com.academix.security.JwtTokenProvider;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final WriterProfileRepository writerProfileRepository;
    private final CollegeRepository collegeRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final RefreshTokenService refreshTokenService;
    
    private final DeviceSessionRepository deviceSessionRepository;
    private final LoginHistoryRepository loginHistoryRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final EmailVerificationTokenRepository emailVerificationTokenRepository;
    private final PlanRepository planRepository;
    private final OrganizationRepository organizationRepository;
    private final BreachCheckService breachCheckService;
    private final com.academix.dto.mapper.UserMapper userMapper;

    public AuthService(UserRepository userRepository,
                       StudentProfileRepository studentProfileRepository,
                       WriterProfileRepository writerProfileRepository,
                       CollegeRepository collegeRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider tokenProvider,
                       RefreshTokenService refreshTokenService,
                       DeviceSessionRepository deviceSessionRepository,
                       LoginHistoryRepository loginHistoryRepository,
                       PasswordResetTokenRepository passwordResetTokenRepository,
                       EmailVerificationTokenRepository emailVerificationTokenRepository,
                       PlanRepository planRepository,
                       OrganizationRepository organizationRepository,
                       BreachCheckService breachCheckService,
                       com.academix.dto.mapper.UserMapper userMapper) {
        this.userRepository = userRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.writerProfileRepository = writerProfileRepository;
        this.collegeRepository = collegeRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.refreshTokenService = refreshTokenService;
        this.deviceSessionRepository = deviceSessionRepository;
        this.loginHistoryRepository = loginHistoryRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.emailVerificationTokenRepository = emailVerificationTokenRepository;
        this.planRepository = planRepository;
        this.organizationRepository = organizationRepository;
        this.breachCheckService = breachCheckService;
        this.userMapper = userMapper;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email address already in use.");
        }

        // Validate password policy
        validatePasswordPolicy(request.getPassword());

        // 1. Instantiate core User record
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone() == null ? "" : request.getPhone());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        user.setStatus(UserStatus.ACTIVE);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        user.setEmailVerified(false);

        // Set Plan to FREE by default
        Plan freePlan = planRepository.findByName("FREE")
                .orElseThrow(() -> new ResourceNotFoundException("Default plan not found"));
        user.setPlan(freePlan);

        // Check if organization details are provided
        if (request.getOrganizationName() != null && !request.getOrganizationName().isBlank()) {
            Organization org = new Organization();
            org.setName(request.getOrganizationName());
            org.setDomain(request.getOrgDomain());
            org.setPlan(freePlan);
            Organization savedOrg = organizationRepository.save(org);
            
            user.setOrganization(savedOrg);
            user.setRoleInOrg("ADMIN");
        }

        User savedUser = userRepository.save(user);

        // 2. Create associated Profile based on designated Role
        if (savedUser.getRole() == Role.STUDENT) {
            StudentProfile studentProfile = new StudentProfile();
            studentProfile.setUser(savedUser);
            studentProfile.setDepartment(request.getCourse());
            studentProfile.setYear(request.getCurrentYear());
            studentProfile.setSemester(1);

            if (request.getCollegeId() != null) {
                College college = collegeRepository.findById(request.getCollegeId()).orElse(null);
                studentProfile.setCollege(college);
            }
            studentProfileRepository.save(studentProfile);

        } else if (savedUser.getRole() == Role.WRITER) {
            WriterProfile writerProfile = new WriterProfile();
            writerProfile.setUser(savedUser);
            writerProfile.setAvailability(true);
            writerProfile.setIsVerified(true);
            writerProfile.setRating(BigDecimal.ZERO);
            writerProfile.setTotalRatings(0);
            writerProfile.setWalletBalance(BigDecimal.ZERO);
            writerProfile.setBio("");
            writerProfile.setExpertise("");
            writerProfile.setNearbyColleges("");
            writerProfile.setSampleWorkUrls("");

            writerProfileRepository.save(writerProfile);
        }

        // Create email verification token
        createEmailVerificationToken(savedUser);

        // Create Device Session
        String sessionId = UUID.randomUUID().toString();
        createDeviceSession(savedUser, sessionId);

        // Generate credentials
        String accessToken = tokenProvider.generateToken(savedUser.getEmail(), savedUser.getRole().name(), sessionId);
        String refreshToken = refreshTokenService.createRefreshToken(savedUser, getClientIp(), getDeviceInfo());

        log.info("New user registered successfully: {}", savedUser.getEmail());
        return new AuthResponse(accessToken, refreshToken, mapToUserResponse(savedUser));
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        // Dynamic Brute Force Protection check
        long failedAttempts = loginHistoryRepository.countFailedAttemptsSince(request.getEmail(), LocalDateTime.now().minusMinutes(15));
        if (failedAttempts >= 5) {
            log.warn("Blocked login attempt due to rate-limiting brute force protection: {}", request.getEmail());
            throw new BadRequestException("Account temporarily locked due to too many failed login attempts. Please try again in 15 minutes.");
        }

        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isEmpty()) {
            log.warn("Login failure - user email not found: {}", request.getEmail());
            // Log failed history
            logLoginHistory(null, request.getEmail(), false, "Invalid credentials");
            throw new UnauthorizedException("Invalid email or password credentials");
        }

        User user = userOpt.get();

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            log.warn("Login failure - invalid password for: {}", request.getEmail());
            logLoginHistory(user, request.getEmail(), false, "Invalid credentials");
            throw new UnauthorizedException("Invalid email or password credentials");
        }

        if (!user.isEmailVerified()) {
            throw new BadRequestException("Please verify your email address before logging in.");
        }

        if (user.getStatus() != UserStatus.ACTIVE) {
            log.warn("Login failure - inactive or suspended status for: {}", request.getEmail());
            logLoginHistory(user, request.getEmail(), false, "Account suspended");
            throw new BadRequestException("User account is suspended or deactivated.");
        }

        // Log successful login
        logLoginHistory(user, request.getEmail(), true, null);

        // Create Device Session
        String sessionId = UUID.randomUUID().toString();
        createDeviceSession(user, sessionId);

        String accessToken = tokenProvider.generateToken(user.getEmail(), user.getRole().name(), sessionId);
        String refreshToken = refreshTokenService.createRefreshToken(user, getClientIp(), getDeviceInfo());

        log.info("User logged in successfully: {}, Session: {}", user.getEmail(), sessionId);
        return new AuthResponse(accessToken, refreshToken, mapToUserResponse(user));
    }

    @Transactional
    public AuthResponse refreshToken(String requestRefreshToken) {
        RefreshToken refreshToken = refreshTokenService.verifyExpirationAndRevocation(requestRefreshToken);
        User user = refreshToken.getUser();

        // Roll device session for access token
        String sessionId = UUID.randomUUID().toString();
        createDeviceSession(user, sessionId);

        String accessToken = tokenProvider.generateToken(user.getEmail(), user.getRole().name(), sessionId);
        String newRefreshToken = refreshTokenService.rotateRefreshToken(requestRefreshToken, getClientIp(), getDeviceInfo());

        log.debug("Rotated credentials for user: {}", user.getEmail());
        return new AuthResponse(accessToken, newRefreshToken, mapToUserResponse(user));
    }

    @Transactional
    public void logout(String refreshToken) {
        refreshTokenService.revokeRefreshToken(refreshToken);
    }

    @Transactional
    public void logoutAll(User user) {
        refreshTokenService.revokeAllUserTokens(user);
        deviceSessionRepository.deleteByUser(user);
        log.info("Revoked all sessions and tokens for user: {}", user.getEmail());
    }

    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            passwordResetTokenRepository.deleteByUser(user);

            String token = UUID.randomUUID().toString();
            PasswordResetToken resetToken = new PasswordResetToken();
            resetToken.setUser(user);
            resetToken.setTokenHash(hashToken(token));
            resetToken.setExpiresAt(LocalDateTime.now().plusHours(1)); // 1 hour expiration
            passwordResetTokenRepository.save(resetToken);

            // Log email delivery mock (no block)
            log.info("Password reset token generated and dispatched to: {} - Token: {}", user.getEmail(), token);
        } else {
            // Secure security best practice: do not leak whether email exists
            log.info("ForgotPassword requested for non-existent email: {}", request.getEmail());
        }
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        String tokenHash = hashToken(request.getToken());
        PasswordResetToken resetToken = passwordResetTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new BadRequestException("Invalid or expired reset token."));

        if (resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            passwordResetTokenRepository.delete(resetToken);
            throw new BadRequestException("Password reset token has expired.");
        }

        // Validate password policy
        validatePasswordPolicy(request.getPassword());

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        // Clean up reset token and revoke all device sessions/refresh tokens for security
        passwordResetTokenRepository.delete(resetToken);
        logoutAll(user);

        log.info("Password reset successfully completed for user: {}", user.getEmail());
    }

    @Transactional
    public void verifyEmail(VerifyEmailRequest request) {
        String tokenHash = hashToken(request.getToken());
        EmailVerificationToken verificationToken = emailVerificationTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new BadRequestException("Invalid email verification token."));

        if (verificationToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            emailVerificationTokenRepository.delete(verificationToken);
            throw new BadRequestException("Verification token has expired. Please request a new one.");
        }

        User user = verificationToken.getUser();
        user.setEmailVerified(true);
        userRepository.save(user);

        // Since we verify by deleting verification tokens from DB:
        emailVerificationTokenRepository.delete(verificationToken);

        log.info("Email verification successful for user: {}", user.getEmail());
    }

    @Transactional
    public void resendVerification(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        emailVerificationTokenRepository.deleteByUser(user);
        createEmailVerificationToken(user);
    }

    public List<DeviceSessionResponse> getActiveSessions(User user, String currentTokenSessionId) {
        return deviceSessionRepository.findByUserId(user.getId()).stream()
                .map(ds -> new DeviceSessionResponse(
                        ds.getSessionId(),
                        ds.getDeviceInfo(),
                        ds.getIpAddress(),
                        ds.getLastActiveAt(),
                        ds.getSessionId().equals(currentTokenSessionId)
                ))
                .collect(Collectors.toList());
    }

    @Transactional
    public void revokeSession(User user, String sessionId) {
        Optional<DeviceSession> dsOpt = deviceSessionRepository.findBySessionId(sessionId);
        if (dsOpt.isPresent()) {
            DeviceSession ds = dsOpt.get();
            if (ds.getUser().getId().equals(user.getId())) {
                deviceSessionRepository.delete(ds);
                log.info("Revoked specific session: {}", sessionId);
            } else {
                throw new UnauthorizedException("Unauthorized session revocation attempt.");
            }
        }
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
    }

    private void createDeviceSession(User user, String sessionId) {
        DeviceSession ds = new DeviceSession();
        ds.setUser(user);
        ds.setSessionId(sessionId);
        ds.setIpAddress(getClientIp());
        ds.setDeviceInfo(getDeviceInfo());
        ds.setLastActiveAt(LocalDateTime.now());
        deviceSessionRepository.save(ds);
    }

    private void createEmailVerificationToken(User user) {
        String token = UUID.randomUUID().toString();
        EmailVerificationToken verificationToken = new EmailVerificationToken();
        verificationToken.setUser(user);
        verificationToken.setTokenHash(hashToken(token));
        verificationToken.setExpiresAt(LocalDateTime.now().plusDays(1)); // 24 hours expiration
        emailVerificationTokenRepository.save(verificationToken);

        log.info("Email verification token generated for: {} - Token: {}", user.getEmail(), token);
    }

    private void logLoginHistory(User user, String email, boolean success, String failureReason) {
        try {
            LoginHistory history = new LoginHistory();
            history.setUser(user);
            history.setEmail(email);
            history.setIpAddress(getClientIp());
            history.setDeviceInfo(getDeviceInfo());
            history.setSuccess(success);
            history.setFailureReason(failureReason);
            loginHistoryRepository.save(history);
        } catch (Exception e) {
            log.error("Failed to log login history event", e);
        }
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

    private String getClientIp() {
        ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attrs != null) {
            HttpServletRequest request = attrs.getRequest();
            String xfHeader = request.getHeader("X-Forwarded-For");
            if (xfHeader == null) {
                return request.getRemoteAddr();
            }
            return xfHeader.split(",")[0];
        }
        return "unknown";
    }

    private String getDeviceInfo() {
        ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attrs != null) {
            return attrs.getRequest().getHeader("User-Agent");
        }
        return "unknown";
    }

    private void validatePasswordPolicy(String password) {
        if (password == null || password.length() < 8) {
            throw new BadRequestException("Password must be at least 8 characters long.");
        }
        boolean hasUppercase = false;
        boolean hasLowercase = false;
        boolean hasDigit = false;
        boolean hasSpecial = false;
        String specialCharacters = "!@#$%^&*()-_=+[]{}|;:',.<>/?";
        for (char c : password.toCharArray()) {
            if (Character.isUpperCase(c)) hasUppercase = true;
            else if (Character.isLowerCase(c)) hasLowercase = true;
            else if (Character.isDigit(c)) hasDigit = true;
            else if (specialCharacters.indexOf(c) >= 0) hasSpecial = true;
        }
        if (!hasUppercase || !hasLowercase || !hasDigit || !hasSpecial) {
            throw new BadRequestException("Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character.");
        }
        if (breachCheckService != null && breachCheckService.isPasswordBreached(password)) {
            throw new BadRequestException("This password has been detected in a public data breach. Please choose a more secure password.");
        }
    }

    public UserResponse mapToUserResponse(User user) {
        return userMapper.toResponse(user);
    }
}
