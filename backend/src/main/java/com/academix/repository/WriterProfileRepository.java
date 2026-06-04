package com.academix.repository;

import com.academix.model.WriterProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface WriterProfileRepository extends JpaRepository<WriterProfile, Long> {
    Optional<WriterProfile> findByUserId(Long userId);
    List<WriterProfile> findByAvailabilityTrueAndIsVerifiedTrue();
    List<WriterProfile> findByIsVerifiedFalse();

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(w) FROM WriterProfile w WHERE w.availability = true AND w.isVerified = true")
    long countActiveVerifiedWriters();

    /**
     * Finds available verified writers within radiusKm of the given coordinates.
     * Uses the Haversine formula in MySQL. Returns writers ordered by distance ASC,
     * then rating DESC.
     * Limit 10 — never pull more than needed.
     */
    @org.springframework.data.jpa.repository.Query(value = """
        SELECT wp.*,
               (6371 * ACOS(
                   LEAST(1.0, COS(RADIANS(:lat)) * COS(RADIANS(wp.latitude))
                   * COS(RADIANS(wp.longitude) - RADIANS(:lng))
                   + SIN(RADIANS(:lat)) * SIN(RADIANS(wp.latitude)))
               )) AS distance_km
        FROM writer_profiles wp
        WHERE wp.availability = true
          AND wp.latitude IS NOT NULL
          AND wp.longitude IS NOT NULL
        HAVING distance_km <= :radiusKm
        ORDER BY distance_km ASC, wp.rating DESC
        LIMIT 10
        """, nativeQuery = true)
    List<WriterProfile> findNearbyAvailableVerifiedWriters(
            @org.springframework.data.repository.query.Param("lat") double lat,
            @org.springframework.data.repository.query.Param("lng") double lng,
            @org.springframework.data.repository.query.Param("radiusKm") double radiusKm);
}
