package com.academix.service;

import com.academix.enums.TransactionReferenceType;
import com.academix.enums.TransactionType;
import com.academix.exception.BadRequestException;
import com.academix.exception.ResourceNotFoundException;
import com.academix.model.User;
import com.academix.model.Wallet;
import com.academix.model.WalletTransaction;
import com.academix.repository.UserRepository;
import com.academix.repository.WalletRepository;
import com.academix.repository.WalletTransactionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class WalletService {

    private static final Logger log = LoggerFactory.getLogger(WalletService.class);

    private final WalletRepository walletRepository;
    private final WalletTransactionRepository walletTransactionRepository;
    private final UserRepository userRepository;

    public WalletService(WalletRepository walletRepository,
                         WalletTransactionRepository walletTransactionRepository,
                         UserRepository userRepository) {
        this.walletRepository = walletRepository;
        this.walletTransactionRepository = walletTransactionRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public Wallet getOrCreateWallet(Long userId) {
        return walletRepository.findByUserId(userId).orElseGet(() -> {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
            Wallet wallet = new Wallet();
            wallet.setUser(user);
            wallet.setBalance(BigDecimal.ZERO);
            wallet.setUpdatedAt(LocalDateTime.now());
            return walletRepository.save(wallet);
        });
    }

    @Transactional
    public BigDecimal getBalance(Long userId) {
        Wallet wallet = getOrCreateWallet(userId);
        return wallet.getBalance();
    }

    @Transactional
    public List<WalletTransaction> getTransactionHistory(Long userId) {
        Wallet wallet = getOrCreateWallet(userId);
        return walletTransactionRepository.findByWalletIdOrderByCreatedAtDesc(wallet.getId());
    }

    @Transactional
    public WalletTransaction credit(Long userId, BigDecimal amount, TransactionReferenceType refType, String referenceId) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Credit amount must be positive.");
        }

        // Enforce idempotent reference checks (prevent double credit)
        if (referenceId != null) {
            Optional<WalletTransaction> existingTxOpt = walletTransactionRepository.findByReferenceId(referenceId);
            if (existingTxOpt.isPresent()) {
                log.warn("Idempotent bypass: Transaction {} already processed", referenceId);
                return existingTxOpt.get();
            }
        }

        // Create wallet if it doesn't exist
        getOrCreateWallet(userId);

        // Fetch under Pessimistic Write lock
        Wallet wallet = walletRepository.findByUserIdWithLock(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet not found for user: " + userId));

        BigDecimal newBalance = wallet.getBalance().add(amount);
        wallet.setBalance(newBalance);
        wallet.setUpdatedAt(LocalDateTime.now());
        walletRepository.save(wallet);

        WalletTransaction tx = new WalletTransaction();
        tx.setWallet(wallet);
        tx.setAmount(amount);
        tx.setType(TransactionType.CREDIT);
        tx.setReferenceType(refType);
        tx.setReferenceId(referenceId);
        tx.setCreatedAt(LocalDateTime.now());
        
        WalletTransaction savedTx = walletTransactionRepository.save(tx);
        log.info("Successfully credited user {} wallet by {}. New Balance: {}", userId, amount, newBalance);
        return savedTx;
    }

    @Transactional
    public WalletTransaction debit(Long userId, BigDecimal amount, TransactionReferenceType refType, String referenceId) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Debit amount must be positive.");
        }

        // Idempotent check
        if (referenceId != null) {
            Optional<WalletTransaction> existingTxOpt = walletTransactionRepository.findByReferenceId(referenceId);
            if (existingTxOpt.isPresent()) {
                log.warn("Idempotent bypass: Transaction {} already processed", referenceId);
                return existingTxOpt.get();
            }
        }

        getOrCreateWallet(userId);

        // Lock wallet for safety
        Wallet wallet = walletRepository.findByUserIdWithLock(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet not found for user: " + userId));

        if (wallet.getBalance().compareTo(amount) < 0) {
            throw new BadRequestException("Insufficient wallet funds for this operation.");
        }

        BigDecimal newBalance = wallet.getBalance().subtract(amount);
        wallet.setBalance(newBalance);
        wallet.setUpdatedAt(LocalDateTime.now());
        walletRepository.save(wallet);

        WalletTransaction tx = new WalletTransaction();
        tx.setWallet(wallet);
        tx.setAmount(amount);
        tx.setType(TransactionType.DEBIT);
        tx.setReferenceType(refType);
        tx.setReferenceId(referenceId);
        tx.setCreatedAt(LocalDateTime.now());

        WalletTransaction savedTx = walletTransactionRepository.save(tx);
        log.info("Successfully debited user {} wallet by {}. New Balance: {}", userId, amount, newBalance);
        return savedTx;
    }
}
