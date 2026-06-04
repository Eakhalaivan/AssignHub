package com.academix.dto.response;

public class AuthResponse {

    private String accessToken;
    private String refreshToken;
    private Object user; 

    public AuthResponse() {}

    public AuthResponse(String accessToken, String refreshToken, Object user) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.user = user;
    }

    public String getAccessToken() { return accessToken; }
    public void setAccessToken(String accessToken) { this.accessToken = accessToken; }

    public String getRefreshToken() { return refreshToken; }
    public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }

    public Object getUser() { return user; }
    public void setUser(Object user) { this.user = user; }
}
