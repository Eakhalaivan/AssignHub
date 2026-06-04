package com.academix.writer.service;

import com.academix.model.WriterProfile;
import com.academix.repository.WriterProfileRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.geo.Circle;
import org.springframework.data.geo.Distance;
import org.springframework.data.geo.GeoResults;
import org.springframework.data.geo.Point;
import org.springframework.data.redis.connection.RedisGeoCommands;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.domain.geo.Metrics;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class WriterGeoService {

    private static final Logger log = LoggerFactory.getLogger(WriterGeoService.class);
    private static final String GEO_KEY = "writers:locations";

    private final RedisTemplate<String, Object> redisTemplate;
    private final WriterProfileRepository writerProfileRepository;

    public WriterGeoService(RedisTemplate<String, Object> redisTemplate, WriterProfileRepository writerProfileRepository) {
        this.redisTemplate = redisTemplate;
        this.writerProfileRepository = writerProfileRepository;
    }

    public void indexWriterLocation(Long writerId, double latitude, double longitude) {
        try {
            redisTemplate.opsForGeo().add(
                    GEO_KEY,
                    new Point(longitude, latitude),
                    writerId.toString()
            );
            log.debug("Indexed writer {} position in Redis GEO", writerId);
        } catch (Exception ex) {
            log.warn("Redis GEO indexing failed ({}). Skipping Redis cache write.", ex.getMessage());
        }
    }

    public List<WriterProfile> findWritersWithinRadius(double latitude, double longitude, double radiusKm) {
        try {
            Circle circle = new Circle(new Point(longitude, latitude), new Distance(radiusKm, Metrics.KILOMETERS));
            RedisGeoCommands.GeoRadiusCommandArgs args = RedisGeoCommands.GeoRadiusCommandArgs
                    .newGeoRadiusArgs()
                    .includeCoordinates()
                    .sortAscending();

            GeoResults<RedisGeoCommands.GeoLocation<Object>> results = redisTemplate.opsForGeo().radius(GEO_KEY, circle, args);

            if (results != null) {
                List<Long> writerIds = results.getContent().stream()
                        .map(res -> Long.parseLong(Objects.requireNonNull(res.getContent().getName()).toString()))
                        .collect(Collectors.toList());
                
                if (!writerIds.isEmpty()) {
                    return writerProfileRepository.findAllById(writerIds);
                }
            }
            return new ArrayList<>();
        } catch (Exception ex) {
            log.warn("Redis GEO matching failed ({}). Falling back to direct database query.", ex.getMessage());
            // Fallback to standard database fetch
            return writerProfileRepository.findByAvailabilityTrueAndIsVerifiedTrue();
        }
    }
}
