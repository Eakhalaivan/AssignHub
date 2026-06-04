package com.academix.security.filters;

import com.academix.dto.response.ErrorResponse;
import com.academix.service.RateLimitingService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    private final RateLimitingService rateLimitingService;
    private final ObjectMapper objectMapper;

    public RateLimitingFilter(
            @org.springframework.beans.factory.annotation.Autowired(required = false) RateLimitingService rateLimitingService,
            ObjectMapper objectMapper) {
        this.rateLimitingService = rateLimitingService;
        this.objectMapper = objectMapper;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String path = request.getRequestURI();
        String method = request.getMethod();

        if (rateLimitingService != null) {
            String clientIp = getClientIp(request);
            boolean allowed = true;

            if ("POST".equalsIgnoreCase(method)) {
                if (path.startsWith("/auth/login")) {
                    // Limit login to 5 attempts per minute per IP
                    allowed = rateLimitingService.isAllowed("login:" + clientIp, 5, 60);
                } else if (path.startsWith("/auth/register")) {
                    // Limit registration to 3 accounts per hour per IP
                    allowed = rateLimitingService.isAllowed("register:" + clientIp, 3, 3600);
                } else if (path.startsWith("/auth/forgot-password") || path.startsWith("/auth/reset-password")) {
                    // Limit passwords resets to 3 attempts per 15 minutes per IP
                    allowed = rateLimitingService.isAllowed("pwd_reset:" + clientIp, 3, 900);
                } else if (path.startsWith("/orders")) {
                    // Limit order creation to 10 per minute per IP
                    allowed = rateLimitingService.isAllowed("order_create:" + clientIp, 10, 60);
                } else if (path.startsWith("/payment")) {
                    // Limit payments requests to 5 per minute per IP
                    allowed = rateLimitingService.isAllowed("payments:" + clientIp, 5, 60);
                } else if (path.startsWith("/files/upload")) {
                    // Limit file uploads to 10 per minute per IP
                    allowed = rateLimitingService.isAllowed("file_upload:" + clientIp, 10, 60);
                }
            }

            if (!allowed) {
                sendRateLimitError(response);
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private void sendRateLimitError(HttpServletResponse response) throws IOException {
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        
        ErrorResponse error = new ErrorResponse(
                "Too many requests. Please slow down and try again later.",
                "RATE_LIMIT_EXCEEDED"
        );
        
        response.getWriter().write(objectMapper.writeValueAsString(error));
    }

    private String getClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0];
    }
}
