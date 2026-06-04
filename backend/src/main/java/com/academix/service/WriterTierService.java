package com.academix.service;

import com.academix.enums.WriterTier;
import com.academix.exception.ResourceNotFoundException;
import com.academix.model.WriterProfile;
import com.academix.repository.WriterProfileRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
public class WriterTierService {

    private static final Logger log = LoggerFactory.getLogger(WriterTierService.class);

    private final WriterProfileRepository writerProfileRepository;

    public WriterTierService(WriterProfileRepository writerProfileRepository) {
        this.writerProfileRepository = writerProfileRepository;
    }

    @Transactional
    public WriterTier evaluateAndUpgradeWriterTier(Long writerProfileId) {
        WriterProfile profile = writerProfileRepository.findById(writerProfileId)
                .orElseThrow(() -> new ResourceNotFoundException("Writer profile not found: " + writerProfileId));

        BigDecimal rating = profile.getRating() != null ? profile.getRating() : BigDecimal.ZERO;
        int totalRatings = profile.getTotalRatings() != null ? profile.getTotalRatings() : 0;

        WriterTier newTier = WriterTier.BRONZE;

        if (rating.compareTo(new BigDecimal("4.8")) >= 0 && totalRatings >= 50) {
            newTier = WriterTier.ELITE;
        } else if (rating.compareTo(new BigDecimal("4.5")) >= 0 && totalRatings >= 20) {
            newTier = WriterTier.PLATINUM;
        } else if (rating.compareTo(new BigDecimal("4.0")) >= 0 && totalRatings >= 10) {
            newTier = WriterTier.GOLD;
        } else if (rating.compareTo(new BigDecimal("3.5")) >= 0 && totalRatings >= 5) {
            newTier = WriterTier.SILVER;
        }

        WriterTier oldTier = profile.getTier();
        if (oldTier != newTier) {
            profile.setTier(newTier);
            writerProfileRepository.save(profile);
            log.info("Writer #{} upgraded from {} to {} based on rating {} across {} reviews.", 
                    writerProfileId, oldTier, newTier, rating, totalRatings);
        }

        return newTier;
    }
}
