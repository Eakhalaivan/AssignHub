package com.academix.controller;

import com.academix.dto.request.UpdateOrderStatusRequest;
import com.academix.dto.response.ApiResponse;
import com.academix.service.WriterAssignmentService;
import com.academix.service.WalletService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.academix.exception.UnauthorizedException;
import com.academix.model.User;
import com.academix.model.WalletTransaction;
import com.academix.enums.TransactionType;
import com.academix.repository.UserRepository;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/writer")
@PreAuthorize("hasRole('WRITER')")
public class WriterController {

    private final WriterAssignmentService writerAssignmentService;
    private final UserRepository userRepository;
    private final WalletService walletService;

    public WriterController(WriterAssignmentService writerAssignmentService, UserRepository userRepository, WalletService walletService) {
        this.writerAssignmentService = writerAssignmentService;
        this.userRepository = userRepository;
        this.walletService = walletService;
    }

    @GetMapping("/assignments")
    public ResponseEntity<ApiResponse<?>> getMyAssignments(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new UnauthorizedException("User not found"));
        return ResponseEntity.ok(new ApiResponse<>(true, "Active tasks catalogued", writerAssignmentService.getAssignmentsByWriter(user.getId())));
    }

    @PutMapping("/availability")
    public ResponseEntity<ApiResponse<?>> toggleAvailability(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new UnauthorizedException("User not found"));
        writerAssignmentService.toggleWriterAvailability(user.getId()); 
        return ResponseEntity.ok(new ApiResponse<>(true, "Availability state synchronized", null));
    }

    @PutMapping("/assignments/{assignmentId}/status")
    public ResponseEntity<ApiResponse<?>> updateAssignmentStatus(@PathVariable Long assignmentId,
                                                                 @RequestBody UpdateOrderStatusRequest request) {
        writerAssignmentService.updateAssignmentStatus(assignmentId, request.getStatus());
        return ResponseEntity.ok(new ApiResponse<>(true, "Task state advanced", null));
    }

    @GetMapping("/earnings")
    public ResponseEntity<ApiResponse<?>> getEarningsLogs(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        BigDecimal walletBalance = walletService.getBalance(user.getId());
        List<WalletTransaction> transactions = walletService.getTransactionHistory(user.getId());

        // Sum all historical credits = total ever earned
        BigDecimal totalEarned = transactions.stream()
                .filter(t -> t.getType() == TransactionType.CREDIT)
                .map(WalletTransaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> earnings = new HashMap<>();
        earnings.put("walletBalance", walletBalance);
        earnings.put("totalEarned", totalEarned);
        earnings.put("pendingPayout", walletBalance);   // balance not yet withdrawn = pending payout
        earnings.put("recentTransactions", transactions.stream().limit(20)
                .map(t -> {
                    Map<String, Object> tx = new HashMap<>();
                    tx.put("amount", t.getAmount());
                    tx.put("type", t.getType());
                    tx.put("referenceType", t.getReferenceType());
                    tx.put("createdAt", t.getCreatedAt());
                    return tx;
                })
                .collect(java.util.stream.Collectors.toList()));

        return ResponseEntity.ok(new ApiResponse<>(true, "Earnings loaded", earnings));
    }

    @PutMapping("/assignments/{assignmentId}/accept")
    public ResponseEntity<ApiResponse<?>> acceptAssignment(
            @PathVariable Long assignmentId,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new UnauthorizedException("User not found"));
        writerAssignmentService.acceptAssignment(assignmentId, user.getId());
        return ResponseEntity.ok(new ApiResponse<>(true, "Assignment accepted successfully", null));
    }

    @PutMapping("/assignments/{assignmentId}/reject")
    public ResponseEntity<ApiResponse<?>> rejectAssignment(
            @PathVariable Long assignmentId,
            @RequestBody(required = false) java.util.Map<String, String> body,
            @RequestParam(value = "reason", required = false) String reason,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new UnauthorizedException("User not found"));
        
        String declineReason = reason;
        if (declineReason == null && body != null) {
            declineReason = body.get("reason");
            if (declineReason == null) {
                declineReason = body.get("declineReason");
            }
        }
        if (declineReason == null || declineReason.isBlank()) {
            declineReason = "Declined by writer";
        }

        writerAssignmentService.rejectAssignment(assignmentId, user.getId(), declineReason);
        return ResponseEntity.ok(new ApiResponse<>(true, "Assignment rejected", null));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<?>> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody com.academix.dto.request.WriterProfileUpdateRequest request) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new com.academix.exception.UnauthorizedException("User not found"));
        writerAssignmentService.updateWriterProfile(user.getId(), request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Profile updated successfully", null));
    }
}
