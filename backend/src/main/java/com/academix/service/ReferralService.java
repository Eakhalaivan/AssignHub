package com.academix.service;

import com.academix.enums.TransactionReferenceType;
import com.academix.exception.BadRequestException;
import com.academix.exception.ResourceNotFoundException;
import com.academix.model.Referral;
import com.academix.model.User;
import com.academix.repository.ReferralRepository;
import com.academix.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ReferralService {

    private static final Logger log = LoggerFactory.getLogger(ReferralService.class);
    private static final BigDecimal REFERRAL_REWARD_AMOUNT = new BigDecimal("250.00");

    private final ReferralRepository referralRepository;
    private final UserRepository userRepository;
    private final WalletService walletService;

    public ReferralService(ReferralRepository referralRepository,
                           UserRepository userRepository,
                           WalletService walletService) {
        this.referralRepository = referralRepository;
        this.userRepository = userRepository;
        this.walletService = walletService;
    }

    @Transactional
    public void trackReferral(String referralCode, Long referredId) {
        // Look up referrer by parsing/attributing code. E.g. we look up referrer by phone or ID
        // Let's assume referral code format is "REF-" + userId
        if (referralCode == null || !referralCode.startsWith("REF-")) {
            log.warn("Invalid referral code format: {}", referralCode);
            return;
        }

        String idStr = referralCode.replace("REF-", "");
        Long referrerId;
        try {
            referrerId = Long.parseLong(idStr);
        } catch (NumberFormatException e) {
            log.warn("Failed to parse referrer ID from code {}", referralCode);
            return;
        }

        // Fraud Check: self-referral prevention
        if (referrerId.equals(referredId)) {
            log.warn("Self-referral blocked for user {}", referredId);
            return;
        }

        Optional<User> referrerOpt = userRepository.findById(referrerId);
        Optional<User> referredOpt = userRepository.findById(referredId);

        if (referrerOpt.isPresent() && referredOpt.isPresent()) {
            User referrer = referrerOpt.get();
            User referred = referredOpt.get();

            // Check if already referred to avoid duplicate attribution
            if (referralRepository.findByReferredId(referredId).isPresent()) {
                log.warn("User {} already attributed under another referral.", referredId);
                return;
            }

            Referral referral = new Referral();
            referral.setReferrer(referrer);
            referral.setReferred(referred);
            referral.setReferralCode(referralCode);
            referral.setStatus("REGISTERED");
            referral.setCreatedAt(LocalDateTime.now());
            
            referralRepository.save(referral);
            log.info("Attributed referral from Referrer #{} to Referred User #{}", referrerId, referredId);
        }
    }

    @Transactional
    public void markReferralQualified(Long referredId) {
        Optional<Referral> referralOpt = referralRepository.findByReferredId(referredId);
        if (referralOpt.isPresent()) {
            Referral referral = referralOpt.get();
            if ("REGISTERED".equals(referral.getStatus())) {
                referral.setStatus("QUALIFIED");
                referralRepository.save(referral);
                log.info("Referral attributed to Referred User #{} qualified for reward processing.", referredId);
                
                payoutReferralRewards(referral);
            }
        }
    }

    private void payoutReferralRewards(Referral referral) {
        if (referral.isRewardPaid()) {
            return;
        }

        try {
            Long referrerId = referral.getReferrer().getId();
            Long referredId = referral.getReferred().getId();

            log.info("Executing referral payout of ₹{} to Referrer #{} and Referred #{}", 
                    REFERRAL_REWARD_AMOUNT, referrerId, referredId);

            // Credit Referrer
            walletService.credit(
                    referrerId,
                    REFERRAL_REWARD_AMOUNT,
                    TransactionReferenceType.REFERRAL_REWARD,
                    "ref_reward_referrer_" + referral.getId()
            );

            // Credit Referred User
            walletService.credit(
                    referredId,
                    REFERRAL_REWARD_AMOUNT,
                    TransactionReferenceType.REFERRAL_REWARD,
                    "ref_reward_referred_" + referral.getId()
            );

            referral.setRewardPaid(true);
            referralRepository.save(referral);
            log.info("Successfully disbursed referral rewards for Referral #{}", referral.getId());
        } catch (Exception ex) {
            log.error("Failed to complete referral reward payouts for Referral #{}", referral.getId(), ex);
        }
    }

    @Transactional(readOnly = true)
    public List<Referral> getMyReferrals(Long referrerId) {
        return referralRepository.findByReferrerId(referrerId);
    }
}
