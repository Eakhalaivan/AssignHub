package com.academix.service;

import com.academix.dto.request.AssignWriterRequest;
import com.academix.enums.*;
import com.academix.exception.BadRequestException;
import com.academix.exception.ResourceNotFoundException;
import com.academix.exception.UnauthorizedException;
import com.academix.model.Assignment;
import com.academix.model.Order;
import com.academix.model.User;
import com.academix.model.WriterProfile;
import com.academix.repository.AssignmentRepository;
import com.academix.repository.OrderRepository;
import com.academix.repository.UserRepository;
import com.academix.repository.WriterProfileRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Service
public class WriterAssignmentService {

    private static final Logger log = LoggerFactory.getLogger(WriterAssignmentService.class);

    private final AssignmentRepository assignmentRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final WriterProfileRepository writerProfileRepository;
    private final NotificationService notificationService;

    public WriterAssignmentService(AssignmentRepository assignmentRepository,
                                   OrderRepository orderRepository,
                                   UserRepository userRepository,
                                   WriterProfileRepository writerProfileRepository,
                                   NotificationService notificationService) {
        this.assignmentRepository = assignmentRepository;
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.writerProfileRepository = writerProfileRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public void assignOrderToWriter(Long orderId, AssignWriterRequest assignRequest) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        User writer = userRepository.findById(assignRequest.getWriterId())
                .orElseThrow(() -> new ResourceNotFoundException("Writer not found with id: " + assignRequest.getWriterId()));

        if (writer.getRole() != Role.WRITER) {
            throw new BadRequestException("User is not a writer");
        }

        WriterProfile profile = writerProfileRepository.findByUserId(writer.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Writer profile not found"));

        if (!Boolean.TRUE.equals(profile.getAvailability())) {
            throw new BadRequestException("Writer is currently unavailable");
        }

        // Prevent duplicate active assignments
        boolean activeExists = assignmentRepository.existsByOrderIdAndStatusIn(orderId, 
                Arrays.asList(AssignmentStatus.PENDING, AssignmentStatus.ACCEPTED, AssignmentStatus.IN_PROGRESS));
        
        if (activeExists) {
            throw new BadRequestException("Order already has an active assignment");
        }

        Assignment assignment = new Assignment();
        assignment.setOrder(order);
        assignment.setWriter(writer);
        assignment.setAssignedBy(AssignedBy.ADMIN);
        assignment.setAssignedAt(LocalDateTime.now());
        assignment.setStatus(AssignmentStatus.PENDING);
        assignmentRepository.save(assignment);

        order.setWriter(writer);
        order.setStatus(OrderStatus.ASSIGNED);
        if (assignRequest.getWriterEarning() != null) {
            order.setWriterEarning(assignRequest.getWriterEarning());
        }
        orderRepository.save(order);
    }

    public List<Assignment> getAssignmentsByWriter(Long writerId) {
        return assignmentRepository.findByWriterId(writerId);
    }

    @Transactional
    public void updateAssignmentStatus(Long assignmentId, OrderStatus newStatus) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found with id: " + assignmentId));

        AssignmentStatus currentAssignmentStatus = assignment.getStatus();
        Order order = assignment.getOrder();

        // Simple state machine logic
        switch (newStatus) {
            case IN_PROGRESS:
                if (currentAssignmentStatus != AssignmentStatus.PENDING && currentAssignmentStatus != AssignmentStatus.ACCEPTED) {
                    throw new BadRequestException("Cannot move to IN_PROGRESS from " + currentAssignmentStatus);
                }
                assignment.setStatus(AssignmentStatus.IN_PROGRESS);
                assignment.setStartedAt(LocalDateTime.now());
                order.setStatus(OrderStatus.IN_PROGRESS);
                break;

            case COMPLETED:
                if (currentAssignmentStatus != AssignmentStatus.IN_PROGRESS) {
                    throw new BadRequestException("Cannot complete assignment that is not IN_PROGRESS");
                }
                assignment.setStatus(AssignmentStatus.COMPLETED);
                assignment.setCompletedAt(LocalDateTime.now());
                order.setStatus(OrderStatus.COMPLETED);
                break;

            case CANCELLED:
                assignment.setStatus(AssignmentStatus.CANCELLED);
                order.setStatus(OrderStatus.PENDING);
                order.setWriter(null); // Return to pool
                break;

            default:
                throw new BadRequestException("Unsupported status transition to " + newStatus);
        }

        assignment.setUpdatedAt(LocalDateTime.now());
        assignmentRepository.save(assignment);
        orderRepository.save(order);
    }

    @Transactional
    public void toggleWriterAvailability(Long writerId) {
        WriterProfile profile = writerProfileRepository.findByUserId(writerId)
                .orElseThrow(() -> new ResourceNotFoundException("Writer profile not found for user: " + writerId));

        profile.setAvailability(!Boolean.TRUE.equals(profile.getAvailability()));
        writerProfileRepository.save(profile);
    }

    @Transactional
    public void acceptAssignment(Long assignmentId, Long writerId) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found: " + assignmentId));

        // Security: only the assigned writer can accept their own assignment
        if (!assignment.getWriter().getId().equals(writerId)) {
            throw new UnauthorizedException("You can only accept your own assignments");
        }

        if (assignment.getStatus() != AssignmentStatus.PENDING) {
            throw new BadRequestException("Only PENDING assignments can be accepted. Current status: "
                    + assignment.getStatus());
        }

        // Accept this assignment
        assignment.setStatus(AssignmentStatus.ACCEPTED);
        assignment.setAcceptedAt(LocalDateTime.now());
        assignment.setUpdatedAt(LocalDateTime.now());
        assignmentRepository.save(assignment);

        // Update the order — now officially ASSIGNED
        Order order = assignment.getOrder();
        order.setStatus(OrderStatus.ASSIGNED);
        order.setWriter(assignment.getWriter());
        order.setUpdatedAt(LocalDateTime.now());
        orderRepository.save(order);

        // Cancel all other PENDING assignments for this order (only one writer can accept)
        List<Assignment> otherAssignments = assignmentRepository.findByOrderId(order.getId());
        for (Assignment other : otherAssignments) {
            if (!other.getId().equals(assignmentId) && other.getStatus() == AssignmentStatus.PENDING) {
                other.setStatus(AssignmentStatus.CANCELLED);
                other.setUpdatedAt(LocalDateTime.now());
                assignmentRepository.save(other);
            }
        }

        // Notify the student
        notificationService.sendNotificationToUser(
                order.getStudent().getId(),
                "Your order #" + order.getId() + " has been accepted by a writer! Work begins shortly."
        );

        log.info("Assignment {} accepted by writer {}. Order {} is now ASSIGNED.", assignmentId, writerId, order.getId());
    }

    @Transactional
    public void rejectAssignment(Long assignmentId, Long writerId, String declineReason) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found: " + assignmentId));

        if (!assignment.getWriter().getId().equals(writerId)) {
            throw new UnauthorizedException("You can only reject your own assignments");
        }

        if (assignment.getStatus() != AssignmentStatus.PENDING) {
            throw new BadRequestException("Only PENDING assignments can be rejected. Current status: "
                    + assignment.getStatus());
        }

        assignment.setStatus(AssignmentStatus.REJECTED);
        assignment.setDeclineReason(declineReason);
        assignment.setUpdatedAt(LocalDateTime.now());
        assignmentRepository.save(assignment);

        // Check if any other pending assignments remain for this order
        long remainingPending = assignmentRepository.findByOrderId(assignment.getOrder().getId())
                .stream()
                .filter(a -> a.getStatus() == AssignmentStatus.PENDING)
                .count();

        // If no writers remain, notify the student
        if (remainingPending == 0) {
            Order order = assignment.getOrder();
            notificationService.sendNotificationToUser(
                    order.getStudent().getId(),
                    "All writers have passed on order #" + order.getId()
                            + ". We are searching for more writers nearby."
            );
        }

        log.info("Assignment {} rejected by writer {} with reason: {}.", assignmentId, writerId, declineReason);
    }

    @Transactional
    public void updateWriterProfile(Long writerId, com.academix.dto.request.WriterProfileUpdateRequest request) {
        WriterProfile profile = writerProfileRepository.findByUserId(writerId)
                .orElseThrow(() -> new ResourceNotFoundException("Writer profile not found for user: " + writerId));

        profile.setBio(request.getBio());
        profile.setDegree(request.getDegree());
        profile.setExpertise(request.getExpertise());
        if (request.getMinDeadlineHours() != null) {
            profile.setMinDeadlineHours(request.getMinDeadlineHours());
        }
        profile.setIsVerified(true);
        writerProfileRepository.save(profile);
        log.info("Writer profile successfully updated for writer user ID: {}", writerId);
    }
}
