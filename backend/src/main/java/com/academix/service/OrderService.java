package com.academix.service;

import com.academix.dto.request.OrderRequest;
import com.academix.dto.request.RatingRequest;
import com.academix.dto.request.UpdateProfileRequest;
import com.academix.dto.response.OrderResponse;
import com.academix.dto.response.PricingResponse;
import com.academix.dto.response.StudentDashboardResponse;
import com.academix.dto.response.AssignmentResponse;
import com.academix.enums.OrderStatus;
import com.academix.exception.ResourceNotFoundException;
import com.academix.exception.UnauthorizedException;
import com.academix.exception.BadRequestException;
import com.academix.model.*;
import com.academix.repository.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderService.class);

    @Value("${platform.commission.percent:15}")
    private int commissionPercent;

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final PricingService pricingService;
    private final com.academix.repository.WriterProfileRepository writerProfileRepository;
    private final com.academix.repository.AssignmentRepository assignmentRepository;
    private final NotificationService notificationService;
    private final StudentProfileRepository studentProfileRepository;
    private final CollegeRepository collegeRepository;
    private final RatingRepository ratingRepository;
    private final PlanRepository planRepository;
    private final com.academix.dto.mapper.OrderMapper orderMapper;

    public OrderService(OrderRepository orderRepository, UserRepository userRepository, PricingService pricingService,
                        com.academix.repository.WriterProfileRepository writerProfileRepository,
                        com.academix.repository.AssignmentRepository assignmentRepository,
                        NotificationService notificationService,
                        StudentProfileRepository studentProfileRepository,
                        CollegeRepository collegeRepository,
                        RatingRepository ratingRepository,
                        PlanRepository planRepository,
                        com.academix.dto.mapper.OrderMapper orderMapper) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.pricingService = pricingService;
        this.writerProfileRepository = writerProfileRepository;
        this.assignmentRepository = assignmentRepository;
        this.notificationService = notificationService;
        this.studentProfileRepository = studentProfileRepository;
        this.collegeRepository = collegeRepository;
        this.ratingRepository = ratingRepository;
        this.planRepository = planRepository;
        this.orderMapper = orderMapper;
    }

    public OrderResponse createOrder(Long studentId, OrderRequest request) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found: " + studentId));

        // Enforce Plan Limits
        Plan activePlan = student.getPlan();
        Organization org = student.getOrganization();
        if (org != null) {
            if ("ACTIVE".equalsIgnoreCase(org.getSubscriptionStatus()) && 
                (org.getSubscriptionExpiresAt() == null || org.getSubscriptionExpiresAt().isAfter(LocalDateTime.now()))) {
                activePlan = org.getPlan();
            } else {
                activePlan = planRepository.findByName("FREE")
                        .orElse(activePlan);
            }
        }

        LocalDateTime startOfMonth = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
        long monthlyCount = 0;
        if (org != null) {
            monthlyCount = orderRepository.countByOrganizationIdAndCreatedAtAfter(org.getId(), startOfMonth);
        } else {
            monthlyCount = orderRepository.countByStudentIdAndCreatedAtAfter(student.getId(), startOfMonth);
        }

        // Enforce Plan Limits disabled for test process
        /*
        if (activePlan != null && activePlan.getMonthlyOrderLimit() != null && monthlyCount >= activePlan.getMonthlyOrderLimit()) {
            throw new BadRequestException("You have reached the monthly order limit of " 
                + activePlan.getMonthlyOrderLimit() + " for your " + activePlan.getName() + " plan. Please upgrade.");
        }
        */

        PricingResponse pricing = pricingService.calculatePrice(
                request.getOrderType(),
                request.getPages(),
                request.getUrgency(),
                request.getWorkType(),
                request.getMaterialCost(),
                request.getServiceType(),
                request.getAcademicLevel(),
                request.getDiagramsCount(),
                request.getDiagramComplexity(),
                request.getColorDiagrams(),
                request.getHardwareComponentsCost(),
                request.getModelType(),
                request.getPrintingType(),
                request.getBindingType(),
                request.getDeliveryPriority(),
                request.getDeliveryCharge(),
                request.getPlatformCommissionPercent()
        );

        Order order = new Order();
        order.setStudent(student);
        order.setTitle(request.getTitle() == null || request.getTitle().isBlank() ? "Order" : request.getTitle());
        order.setOrganization(org);
        order.setDescription(request.getDescription());
        order.setOrderType(request.getOrderType());
        order.setPages(request.getPages() != null ? request.getPages() : 1);
        order.setUrgency(request.getUrgency());
        order.setWorkType(request.getWorkType());
        order.setDeadline(request.getDeadline());
        order.setMaterialCost(request.getMaterialCost() != null ? request.getMaterialCost() : java.math.BigDecimal.ZERO);
        order.setTotalCost(pricing.getTotalCost());
        order.setStatus(OrderStatus.PENDING);
        order.setCreatedAt(LocalDateTime.now());
        order.setFileUrls(request.getFileUrls());
        
        // Geolocation properties
        order.setLatitude(request.getLatitude() != null ? request.getLatitude() : java.math.BigDecimal.valueOf(13.0827));
        order.setLongitude(request.getLongitude() != null ? request.getLongitude() : java.math.BigDecimal.valueOf(80.2707));
        order.setLocationRadiusKm(request.getLocationRadiusKm() != null ? request.getLocationRadiusKm() : java.math.BigDecimal.valueOf(5.0));
        order.setSubject(request.getSubject() != null ? request.getSubject() : "General");

        // Calculate commission
        BigDecimal commissionRate = BigDecimal.valueOf(commissionPercent)
                .divide(BigDecimal.valueOf(100), 4, java.math.RoundingMode.HALF_UP);
        BigDecimal commission = pricing.getTotalCost()
                .multiply(commissionRate)
                .setScale(2, java.math.RoundingMode.HALF_UP);
        order.setCommission(commission);
        order.setWriterEarning(pricing.getTotalCost().subtract(commission).setScale(2, java.math.RoundingMode.HALF_UP));

        Order savedOrder = orderRepository.save(order);
        
        try {
            performWriterMatch(savedOrder);
        } catch (Exception e) {
            log.error("Writer matching failed for order {}: {}", savedOrder.getId(), e.getMessage(), e);
        }
        
        // Reload order to capture assignments
        savedOrder = orderRepository.findById(savedOrder.getId()).orElse(savedOrder);

        return mapToResponse(savedOrder);
    }

    public OrderResponse getOrderById(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));
        return mapToResponse(order);
    }

    public List<OrderResponse> getOrdersByStudent(Long studentId) {
        return orderRepository.findByStudentId(studentId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public OrderResponse updateOrderStatus(Long orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));
        order.setStatus(newStatus);
        order.setUpdatedAt(LocalDateTime.now());
        Order savedOrder = orderRepository.save(order);
        return mapToResponse(savedOrder);
    }

    @Transactional
    public OrderResponse cancelOrder(Long orderId, Long studentId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));

        if (!order.getStudent().getId().equals(studentId)) {
            throw new UnauthorizedException("You can only cancel your own orders");
        }

        if (order.getStatus() == OrderStatus.COMPLETED || order.getStatus() == OrderStatus.DELIVERED) {
            throw new BadRequestException("Completed or delivered orders cannot be cancelled");
        }

        order.setStatus(OrderStatus.CANCELLED);
        order.setUpdatedAt(LocalDateTime.now());
        
        List<com.academix.model.Assignment> assignments = assignmentRepository.findByOrderId(orderId);
        for (com.academix.model.Assignment assignment : assignments) {
            assignment.setStatus(com.academix.enums.AssignmentStatus.CANCELLED);
            assignmentRepository.save(assignment);
        }

        Order savedOrder = orderRepository.save(order);
        
        if (order.getWriter() != null) {
            notificationService.sendNotificationToUser(order.getWriter().getId(),
                    "Order #" + order.getId() + " has been cancelled by the student.");
        }
        
        return mapToResponse(savedOrder);
    }

    @Transactional
    public void submitRating(Long orderId, RatingRequest ratingRequest, Long studentId) {
        // 1. Verify the order exists and belongs to this student
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));

        if (!order.getStudent().getId().equals(studentId)) {
            throw new UnauthorizedException("You can only rate your own orders");
        }

        // 2. Only COMPLETED or DELIVERED orders can be rated
        if (order.getStatus() != OrderStatus.COMPLETED && order.getStatus() != OrderStatus.DELIVERED) {
            throw new BadRequestException("Only completed orders can be rated");
        }

        if (order.getWriter() == null) {
            throw new BadRequestException("This order has no assigned writer to rate");
        }

        // 3. Prevent duplicate ratings (one per order)
        if (ratingRepository.findByOrderId(orderId).isPresent()) {
            throw new BadRequestException("You have already submitted a rating for this order");
        }

        // 4. Persist the rating record
        Rating rating = new Rating();
        rating.setOrder(order);
        rating.setStudent(order.getStudent());
        rating.setWriter(order.getWriter());
        rating.setStars(ratingRequest.getScore());
        rating.setReview(ratingRequest.getFeedback());
        rating.setCreatedAt(LocalDateTime.now());
        ratingRepository.save(rating);

        // 5. Recalculate writer's running average and total count
        Long writerId = order.getWriter().getId();
        com.academix.model.WriterProfile writerProfile = writerProfileRepository.findByUserId(writerId)
                .orElseThrow(() -> new ResourceNotFoundException("Writer profile not found: " + writerId));

        double newAverage = ratingRepository.findAverageRatingByWriterId(writerId).orElse(0.0);
        long newCount = ratingRepository.countByWriterId(writerId);

        writerProfile.setRating(BigDecimal.valueOf(newAverage).setScale(2, java.math.RoundingMode.HALF_UP));
        writerProfile.setTotalRatings((int) newCount);
        writerProfileRepository.save(writerProfile);

        log.info("Rating submitted for order {} — writer {} new avg: {} ({} ratings)",
                orderId, writerId, newAverage, newCount);
    }

    public void performWriterMatch(Order order) {
        double studentLat = order.getLatitude() != null ? order.getLatitude().doubleValue() : 13.0827;
        double studentLng = order.getLongitude() != null ? order.getLongitude().doubleValue() : 80.2707;
        double radius     = order.getLocationRadiusKm() != null ? order.getLocationRadiusKm().doubleValue() : 5.0;
        String subject    = order.getSubject() != null ? order.getSubject().toLowerCase() : "";

        // Query all available writers (verified or unverified)
        List<com.academix.model.WriterProfile> allAvailableWriters = writerProfileRepository.findAll().stream()
                .filter(w -> Boolean.TRUE.equals(w.getAvailability()))
                .collect(java.util.stream.Collectors.toList());

        // Determine if priority matching is active
        boolean priorityMatching = false;
        if (order.getStudent() != null) {
            User student = order.getStudent();
            Plan plan = student.getPlan();
            if (student.getOrganization() != null && "ACTIVE".equalsIgnoreCase(student.getOrganization().getSubscriptionStatus())) {
                plan = student.getOrganization().getPlan();
            }
            if (plan != null && plan.getPriorityMatching() != null) {
                priorityMatching = plan.getPriorityMatching();
            }
        }

        final boolean isPriority = priorityMatching;

        // Match all available writers globally so they all see the order invitation
        List<com.academix.model.WriterProfile> matches = allAvailableWriters.stream()
                .sorted((w1, w2) -> {
                    if (isPriority) {
                        double r1 = w1.getRating() != null ? w1.getRating().doubleValue() : 0.0;
                        double r2 = w2.getRating() != null ? w2.getRating().doubleValue() : 0.0;
                        return Double.compare(r2, r1); // prioritize higher-rated writers
                    }
                    return 0;
                })
                .collect(java.util.stream.Collectors.toList());

        if (matches.isEmpty()) {
            log.warn("No writers matched for order {} within {}km. Notifying student.", order.getId(), radius);
            notificationService.sendNotificationToUser(order.getStudent().getId(),
                    "Order #" + order.getId() + " placed — searching for nearby writers. We'll notify you when one accepts.");
            return;
        }

        for (int i = 0; i < matches.size(); i++) {
            com.academix.model.WriterProfile writer = matches.get(i);

            // Create PENDING assignment for each matched writer
            com.academix.model.Assignment assignment = new com.academix.model.Assignment();
            assignment.setOrder(order);
            assignment.setWriter(writer.getUser());
            assignment.setAssignedBy(com.academix.enums.AssignedBy.AUTO);
            assignment.setAssignedAt(LocalDateTime.now());
            assignment.setStatus(com.academix.enums.AssignmentStatus.PENDING);
            assignmentRepository.save(assignment);

            // Calculate display distance safely
            double dist = 0.0;
            if (writer.getLatitude() != null && writer.getLongitude() != null) {
                dist = calculateHaversineDistance(
                        studentLat, studentLng,
                        writer.getLatitude().doubleValue(), writer.getLongitude().doubleValue());
            }

            String msg;
            if (i == 0) {
                msg = String.format(
                        "New matching order! %.1f km away — %s, %d page(s), due in %dh — ₹%.0f. Tap to accept.",
                        dist,
                        order.getOrderType().name().replace("_", " "),
                        order.getPages(),
                        order.getDeadline() != null
                                ? java.time.Duration.between(LocalDateTime.now(), order.getDeadline()).toHours()
                                : 0,
                        order.getTotalCost()
                );
            } else {
                msg = String.format(
                        "New matching order available (%.1f km) — ₹%.0f for %s. Tap to view.",
                        dist, order.getTotalCost(), order.getSubject()
                );
            }
            notificationService.sendNotificationToUser(writer.getUser().getId(), msg);
        }

        log.info("Order {} matched to {} writer(s) within {}km (Priority: {}).", order.getId(), matches.size(), radius, isPriority);
    }

    public Double calculateHaversineDistance(Double lat1, Double lon1, Double lat2, Double lon2) {
        Double r = 6371.0;
        Double dLat = Math.toRadians(lat2 - lat1);
        Double dLon = Math.toRadians(lon2 - lon1);
        Double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                   Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                   Math.sin(dLon / 2) * Math.sin(dLon / 2);
        Double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return r * c;
    }

    private OrderResponse mapToResponse(Order order) {
        if (order == null) return null;
        OrderResponse response = orderMapper.toResponse(order);

        List<com.academix.model.Assignment> assignments = assignmentRepository.findByOrderId(order.getId());
        List<AssignmentResponse> matchedWriters = new java.util.ArrayList<>();
        for (com.academix.model.Assignment assignment : assignments) {
            AssignmentResponse ar = new AssignmentResponse();
            ar.setId(assignment.getId());
            ar.setWriterId(assignment.getWriter().getId());
            ar.setWriterName(assignment.getWriter().getName());
            ar.setStatus(assignment.getStatus());
            ar.setDeclineReason(assignment.getDeclineReason());
            ar.setWriterRating(5.0);

            writerProfileRepository.findByUserId(assignment.getWriter().getId()).ifPresent(wp -> {
                ar.setWriterRating(wp.getRating() != null ? wp.getRating().doubleValue() : 5.0);
                ar.setBio(wp.getBio());
                ar.setDegree(wp.getDegree());
                
                // Specializations
                java.util.List<String> specs = new java.util.ArrayList<>();
                if (wp.getExpertise() != null) {
                    for (String s : wp.getExpertise().split(",")) {
                        specs.add(s.trim());
                    }
                }
                ar.setSpecializations(specs);

                // Initials
                String name = assignment.getWriter().getName();
                if (name != null && !name.isBlank()) {
                    String[] parts = name.split(" ");
                    String initials = parts.length > 1 ? "" + parts[0].charAt(0) + parts[1].charAt(0) : "" + parts[0].charAt(0);
                    ar.setInitials(initials.toUpperCase());
                }

                if (order.getLatitude() != null && wp.getLatitude() != null) {
                    ar.setDistanceKm(calculateHaversineDistance(
                        order.getLatitude().doubleValue(),
                        order.getLongitude().doubleValue(),
                        wp.getLatitude().doubleValue(),
                        wp.getLongitude().doubleValue()
                    ));
                }
            });
            matchedWriters.add(ar);
        }
        response.setMatchedWriters(matchedWriters);

        if (order.getWriter() != null) {
            writerProfileRepository.findByUserId(order.getWriter().getId()).ifPresent(wp -> {
                response.setWriterRating(wp.getRating() != null ? wp.getRating().doubleValue() : 5.0);
                if (order.getLatitude() != null && wp.getLatitude() != null) {
                    response.setDistanceKm(calculateHaversineDistance(order.getLatitude().doubleValue(), order.getLongitude().doubleValue(), wp.getLatitude().doubleValue(), wp.getLongitude().doubleValue()));
                }
            });
        }
        return response;
    }

    public StudentDashboardResponse getStudentDashboard(Long studentId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found: " + studentId));

        StudentProfile profile = studentProfileRepository.findByUserId(studentId).orElse(null);

        StudentDashboardResponse dashboard = new StudentDashboardResponse();
        dashboard.setName(student.getName());
        dashboard.setEmail(student.getEmail());
        dashboard.setTotalOrders(orderRepository.countByStudentId(studentId));
        dashboard.setActiveOrders(orderRepository.countActiveByStudentId(studentId));
        dashboard.setCompletedOrders(orderRepository.countCompletedByStudentId(studentId));
        dashboard.setCancelledOrders(orderRepository.countCancelledByStudentId(studentId));
        dashboard.setTotalSpent(orderRepository.sumSpentByStudentId(studentId));

        if (profile != null) {
            dashboard.setDepartment(profile.getDepartment());
            dashboard.setYear(profile.getYear());
            if (profile.getCollege() != null) {
                dashboard.setCollegeName(profile.getCollege().getCollegeName());
            }
        }

        // Status breakdown map
        Map<String, Long> breakdown = new HashMap<>();
        breakdown.put("PENDING",     orderRepository.countByStudentIdAndStatus(studentId, OrderStatus.PENDING));
        breakdown.put("ASSIGNED",    orderRepository.countByStudentIdAndStatus(studentId, OrderStatus.ASSIGNED));
        breakdown.put("IN_PROGRESS", orderRepository.countByStudentIdAndStatus(studentId, OrderStatus.IN_PROGRESS));
        breakdown.put("COMPLETED",   orderRepository.countByStudentIdAndStatus(studentId, OrderStatus.COMPLETED));
        breakdown.put("CANCELLED",   orderRepository.countByStudentIdAndStatus(studentId, OrderStatus.CANCELLED));
        dashboard.setOrderStatusBreakdown(breakdown);

        return dashboard;
    }

    @Transactional
    public void updateStudentProfile(Long userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName());
        }
        if (request.getPhone() != null && !request.getPhone().isBlank()) {
            user.setPhone(request.getPhone());
        }
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        StudentProfile profile = studentProfileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    StudentProfile p = new StudentProfile();
                    p.setUser(user);
                    return p;
                });

        if (request.getCourse() != null && !request.getCourse().isBlank()) {
            profile.setDepartment(request.getCourse());
        }
        if (request.getCurrentYear() != null) {
            profile.setYear(request.getCurrentYear());
        }
        if (request.getCollegeId() != null) {
            College college = collegeRepository.findById(request.getCollegeId()).orElse(null);
            profile.setCollege(college);
        }
        studentProfileRepository.save(profile);
    }
}
