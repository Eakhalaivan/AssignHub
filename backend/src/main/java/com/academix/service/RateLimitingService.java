package com.academix.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

@Service
public class RateLimitingService {

    private static final Logger log = LoggerFactory.getLogger(RateLimitingService.class);

    private final RedisTemplate<String, Object> redisTemplate;
    // Resilient fallback in-memory cache if Redis is down
    private final ConcurrentHashMap<String, LocalTokenBucket> localBuckets = new ConcurrentHashMap<>();

    public RateLimitingService(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public boolean isAllowed(String key, int maxRequests, int windowSeconds) {
        try {
            String redisKey = "rate_limit:" + key;
            Long currentRequests = redisTemplate.opsForValue().increment(redisKey);
            
            if (currentRequests != null && currentRequests == 1) {
                redisTemplate.expire(redisKey, windowSeconds, TimeUnit.SECONDS);
            }
            
            if (currentRequests != null && currentRequests > maxRequests) {
                log.warn("Rate limit exceeded for key: {} (Limit: {}, Window: {}s)", key, maxRequests, windowSeconds);
                return false;
            }
            return true;
        } catch (Exception ex) {
            log.warn("Redis rate limiter unavailable ({}). Falling back to in-memory limiter.", ex.getMessage());
            // Graceful fallback to local token bucket
            return isAllowedLocal(key, maxRequests, windowSeconds);
        }
    }

    private boolean isAllowedLocal(String key, int maxRequests, int windowSeconds) {
        LocalTokenBucket bucket = localBuckets.computeIfAbsent(key, k -> new LocalTokenBucket(maxRequests, windowSeconds));
        return bucket.tryConsume();
    }

    private static class LocalTokenBucket {
        private final int maxRequests;
        private final long windowMillis;
        private int tokens;
        private long lastRefillTime;

        public LocalTokenBucket(int maxRequests, int windowSeconds) {
            this.maxRequests = maxRequests;
            this.windowMillis = windowSeconds * 1000L;
            this.tokens = maxRequests;
            this.lastRefillTime = System.currentTimeMillis();
        }

        public synchronized boolean tryConsume() {
            refill();
            if (tokens > 0) {
                tokens--;
                return true;
            }
            return false;
        }

        private void refill() {
            long now = System.currentTimeMillis();
            long timeElapsed = now - lastRefillTime;
            if (timeElapsed >= windowMillis) {
                tokens = maxRequests;
                lastRefillTime = now;
            }
        }
    }
}
