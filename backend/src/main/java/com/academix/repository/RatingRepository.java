package com.academix.repository;

import com.academix.model.Rating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface RatingRepository extends JpaRepository<Rating, Long> {
    Optional<Rating> findByOrderId(Long orderId);

    @Query("SELECT AVG(r.stars) FROM Rating r WHERE r.writer.id = :writerId")
    Optional<Double> findAverageRatingByWriterId(@Param("writerId") Long writerId);

    @Query("SELECT COUNT(r) FROM Rating r WHERE r.writer.id = :writerId")
    long countByWriterId(@Param("writerId") Long writerId);
}
