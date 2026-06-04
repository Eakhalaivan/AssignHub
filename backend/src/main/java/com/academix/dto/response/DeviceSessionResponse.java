package com.academix.dto.response;

import java.time.LocalDateTime;

public class DeviceSessionResponse {
    private String sessionId;
    private String deviceInfo;
    private String ipAddress;
    private LocalDateTime lastActiveAt;
    private boolean currentSession;

    public DeviceSessionResponse() {}

    public DeviceSessionResponse(String sessionId, String deviceInfo, String ipAddress, LocalDateTime lastActiveAt, boolean currentSession) {
        this.sessionId = sessionId;
        this.deviceInfo = deviceInfo;
        this.ipAddress = ipAddress;
        this.lastActiveAt = lastActiveAt;
        this.currentSession = currentSession;
    }

    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }

    public String getDeviceInfo() { return deviceInfo; }
    public void setDeviceInfo(String deviceInfo) { this.deviceInfo = deviceInfo; }

    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }

    public LocalDateTime getLastActiveAt() { return lastActiveAt; }
    public void setLastActiveAt(LocalDateTime lastActiveAt) { this.lastActiveAt = lastActiveAt; }

    public boolean isCurrentSession() { return currentSession; }
    public void setCurrentSession(boolean currentSession) { this.currentSession = currentSession; }
}
