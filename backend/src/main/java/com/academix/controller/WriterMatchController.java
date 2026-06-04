package com.academix.controller;

import com.academix.dto.response.ApiResponse;
import com.academix.dto.response.WriterProfileResponse;
import com.academix.enums.AssignmentStatus;
import com.academix.enums.OrderStatus;
import com.academix.exception.UnauthorizedException;
import com.academix.model.Assignment;
import com.academix.model.Order;
import com.academix.model.User;
import com.academix.model.WriterProfile;
import com.academix.repository.AssignmentRepository;
import com.academix.repository.OrderRepository;
import com.academix.repository.UserRepository;
import com.academix.repository.WriterProfileRepository;
import com.academix.service.NotificationService;
import com.academix.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/writermatch")
public class WriterMatchController {

    private final WriterProfileRepository writerProfileRepository;
    private final AssignmentRepository assignmentRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final OrderService orderService;

    public WriterMatchController(WriterProfileRepository writerProfileRepository,
                                 AssignmentRepository assignmentRepository,
                                 OrderRepository orderRepository,
                                 UserRepository userRepository,
                                 NotificationService notificationService,
                                 OrderService orderService) {
        this.writerProfileRepository = writerProfileRepository;
        this.assignmentRepository = assignmentRepository;
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.orderService = orderService;
    }

    @GetMapping("/nearby-writers")
    public ResponseEntity<ApiResponse<List<WriterProfileResponse>>> getNearbyWriters(
            @RequestParam Double latitude,
            @RequestParam Double longitude,
            @RequestParam(defaultValue = "5.0") Double radius) {

        List<WriterProfile> allWriters = writerProfileRepository.findAll();
        List<WriterProfileResponse> responses = new ArrayList<>();

        for (WriterProfile wp : allWriters) {
            if (wp.getLatitude() == null || wp.getLongitude() == null) continue;

            Double distance = orderService.calculateHaversineDistance(latitude, longitude, wp.getLatitude().doubleValue(), wp.getLongitude().doubleValue());
            if (distance <= radius) {
                WriterProfileResponse res = new WriterProfileResponse();
                res.setId(wp.getUser().getId());
                res.setName(wp.getUser().getName());
                res.setBio(wp.getBio());
                res.setIsAvailable(wp.getAvailability());
                res.setRating(wp.getRating() != null ? wp.getRating().doubleValue() : 0.0);
                res.setVerificationStatus(wp.getIsVerified() ? "VERIFIED" : "PENDING");
                
                res.setLatitude(wp.getLatitude());
                res.setLongitude(wp.getLongitude());
                res.setHourlyRateUsd(wp.getHourlyRateUsd());
                res.setDegree(wp.getDegree());
                res.setMinDeadlineHours(wp.getMinDeadlineHours());
                res.setDistanceKm(distance);

                // Initials
                String[] parts = wp.getUser().getName().split(" ");
                String initials = parts.length > 1 ? "" + parts[0].charAt(0) + parts[1].charAt(0) : "" + parts[0].charAt(0);
                res.setInitials(initials.toUpperCase());

                // Specializations
                List<String> specs = new ArrayList<>();
                if (wp.getExpertise() != null) {
                    for (String s : wp.getExpertise().split(",")) {
                        specs.add(s.trim());
                    }
                }
                res.setSpecializations(specs);
                responses.add(res);
            }
        }

        // Sort by distance ascending
        responses.sort((r1, r2) -> r1.getDistanceKm().compareTo(r2.getDistanceKm()));

        return ResponseEntity.ok(new ApiResponse<>(true, "Live search completed", responses));
    }

    @GetMapping("/invitations")
    public ResponseEntity<ApiResponse<List<Assignment>>> getPendingInvitations(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        List<Assignment> invitations = assignmentRepository.findByWriterId(user.getId()).stream()
                .filter(a -> a.getStatus() == AssignmentStatus.PENDING)
                .collect(Collectors.toList());

        return ResponseEntity.ok(new ApiResponse<>(true, "Sync complete", invitations));
    }

    @PostMapping("/respond")
    public ResponseEntity<ApiResponse<?>> respondToInvitation(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam Long assignmentId,
            @RequestParam Boolean accept) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Invitation not found"));

        if (!assignment.getWriter().getId().equals(user.getId())) {
            throw new UnauthorizedException("Access Denied");
        }

        if (accept) {
            // Update Assignment Status
            assignment.setStatus(AssignmentStatus.ACCEPTED);
            assignment.setAcceptedAt(LocalDateTime.now());
            assignment.setStartedAt(LocalDateTime.now());
            assignmentRepository.save(assignment);

            // Update Order Status
            Order order = assignment.getOrder();
            order.setStatus(OrderStatus.ASSIGNED);
            order.setWriter(user);
            orderRepository.save(order);

            // Update Writer Availability to Busy
            writerProfileRepository.findByUserId(user.getId()).ifPresent(wp -> {
                wp.setAvailability(false);
                writerProfileRepository.save(wp);
            });

            // Reject other pending invitations for this order
            List<Assignment> others = assignmentRepository.findByOrderId(order.getId());
            for (Assignment other : others) {
                if (!other.getId().equals(assignment.getId()) && other.getStatus() == AssignmentStatus.PENDING) {
                    other.setStatus(AssignmentStatus.REJECTED);
                    assignmentRepository.save(other);
                }
            }

            // Calculate distance for notification
            Double distance = 0.8;
            WriterProfile wp = writerProfileRepository.findByUserId(user.getId()).orElse(null);
            if (wp != null && order.getLatitude() != null) {
                distance = orderService.calculateHaversineDistance(order.getLatitude().doubleValue(), order.getLongitude().doubleValue(), wp.getLatitude().doubleValue(), wp.getLongitude().doubleValue());
            }

            // Send Notifications
            notificationService.sendNotificationToUser(order.getStudent().getId(), 
                "Match found! " + user.getName() + " (" + String.format("%.1f", distance) + " km away, ★ " + 
                (wp != null && wp.getRating() != null ? wp.getRating() : "4.9") + ") has accepted your order.");

            notificationService.sendNotificationToUser(user.getId(), 
                "Order #" + order.getId() + " has been assigned to you. Please begin within 1 hour.");

            return ResponseEntity.ok(new ApiResponse<>(true, "Assignment successfully accepted", null));
        } else {
            // Reject Invitation
            assignment.setStatus(AssignmentStatus.REJECTED);
            assignmentRepository.save(assignment);

            return ResponseEntity.ok(new ApiResponse<>(true, "Invitation declined", null));
        }
    }
}
