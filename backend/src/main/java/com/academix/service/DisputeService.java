package com.academix.service;

import com.academix.enums.DisputeStatus;
import com.academix.enums.OrderStatus;
import com.academix.enums.TransactionReferenceType;
import com.academix.exception.BadRequestException;
import com.academix.exception.ResourceNotFoundException;
import com.academix.model.Dispute;
import com.academix.model.Order;
import com.academix.model.User;
import com.academix.repository.DisputeRepository;
import com.academix.repository.OrderRepository;
import com.academix.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class DisputeService {

    private static final Logger log = LoggerFactory.getLogger(DisputeService.class);

    private final DisputeRepository disputeRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final WalletService walletService;

    public DisputeService(DisputeRepository disputeRepository,
                          OrderRepository orderRepository,
                          UserRepository userRepository,
                          WalletService walletService) {
        this.disputeRepository = disputeRepository;
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.walletService = walletService;
    }

    @Transactional
    public Dispute openDispute(Long orderId, Long creatorId, String reason, String evidenceUrl) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));

        User creator = userRepository.findById(creatorId)
                .orElseThrow(() -> new ResourceNotFoundException("Creator not found: " + creatorId));

        // Only students or writers involved in the order can open disputes
        boolean isStudent = order.getStudent().getId().equals(creatorId);
        boolean isWriter = order.getWriter() != null && order.getWriter().getId().equals(creatorId);

        if (!isStudent && !isWriter) {
            throw new BadRequestException("Unauthorized: Creator not associated with this order.");
        }

        Dispute dispute = new Dispute();
        dispute.setOrder(order);
        dispute.setCreator(creator);
        dispute.setReason(reason);
        dispute.setEvidenceUrl(evidenceUrl);
        dispute.setStatus(DisputeStatus.OPEN);
        dispute.setCreatedAt(LocalDateTime.now());

        // Update order status if appropriate
        order.setStatus(OrderStatus.PENDING); // Flag order state under investigation
        orderRepository.save(order);

        Dispute savedDispute = disputeRepository.save(dispute);
        log.info("Dispute #{} opened for Order #{} by User {}", savedDispute.getId(), orderId, creatorId);
        return savedDispute;
    }

    @Transactional
    public Dispute assignDispute(Long disputeId, Long adminId) {
        Dispute dispute = disputeRepository.findById(disputeId)
                .orElseThrow(() -> new ResourceNotFoundException("Dispute not found: " + disputeId));

        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found: " + adminId));

        dispute.setHandler(admin);
        dispute.setStatus(DisputeStatus.UNDER_REVIEW);
        
        Dispute saved = disputeRepository.save(dispute);
        log.info("Dispute #{} assigned to Admin {}", disputeId, adminId);
        return saved;
    }

    @Transactional
    public Dispute resolveDispute(Long disputeId, DisputeStatus finalStatus, String resolutionNotes) {
        Dispute dispute = disputeRepository.findById(disputeId)
                .orElseThrow(() -> new ResourceNotFoundException("Dispute not found: " + disputeId));

        if (dispute.getStatus() == DisputeStatus.RESOLVED || dispute.getStatus() == DisputeStatus.CLOSED) {
            throw new BadRequestException("Dispute has already been resolved.");
        }

        dispute.setStatus(finalStatus);
        dispute.setResolutionNotes(resolutionNotes);
        dispute.setResolvedAt(LocalDateTime.now());

        Order order = dispute.getOrder();

        if (finalStatus == DisputeStatus.RESOLVED) {
            // Dispute approved in favor of creator/student -> execute refund
            log.info("Dispute #{} resolved in favor of Student. Initiating wallet refund...", disputeId);
            walletService.credit(
                    order.getStudent().getId(),
                    order.getTotalCost(),
                    TransactionReferenceType.REFUND,
                    "dispute_refund_" + disputeId
            );
            order.setStatus(OrderStatus.PENDING); // Refunded and reset
        } else {
            // Rejected dispute -> release payment to writer or close
            log.info("Dispute #{} rejected. Releasing funds to writer...", disputeId);
            if (order.getWriter() != null) {
                walletService.credit(
                        order.getWriter().getId(),
                        order.getWriterEarning(),
                        TransactionReferenceType.WRITER_EARNING,
                        "dispute_payout_" + disputeId
                );
            }
            order.setStatus(OrderStatus.COMPLETED);
        }

        orderRepository.save(order);
        Dispute saved = disputeRepository.save(dispute);
        log.info("Dispute #{} resolution finalized with status {}", disputeId, finalStatus);
        return saved;
    }

    @Transactional(readOnly = true)
    public List<Dispute> getDisputesForOrder(Long orderId) {
        return disputeRepository.findByOrderId(orderId);
    }
}
