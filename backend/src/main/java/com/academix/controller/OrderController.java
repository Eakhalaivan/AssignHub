package com.academix.controller;

import com.academix.dto.request.OrderRequest;
import com.academix.dto.request.RatingRequest;
import com.academix.dto.response.ApiResponse;
import com.academix.dto.response.OrderResponse;
import com.academix.dto.response.PricingResponse;
import com.academix.enums.OrderType;
import com.academix.enums.Urgency;
import com.academix.enums.WorkType;
import com.academix.service.OrderService;
import com.academix.service.PricingService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.academix.exception.UnauthorizedException;
import com.academix.model.User;
import com.academix.repository.UserRepository;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/orders")
public class OrderController {

    private final OrderService orderService;
    private final PricingService pricingService;
    private final UserRepository userRepository;

    public OrderController(OrderService orderService, PricingService pricingService, UserRepository userRepository) {
        this.orderService = orderService;
        this.pricingService = pricingService;
        this.userRepository = userRepository;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<OrderResponse>> createOrder(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody OrderRequest request) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new UnauthorizedException("User not found"));
        OrderResponse response = orderService.createOrder(user.getId(), request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Transaction recorded", response));
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderById(@PathVariable Long orderId) {
        OrderResponse response = orderService.getOrderById(orderId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Specifications retrieved", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getMyOrders(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new UnauthorizedException("User not found"));
        List<OrderResponse> response = orderService.getOrdersByStudent(user.getId());
        return ResponseEntity.ok(new ApiResponse<>(true, "Transactional history synced", response));
    }

    @PostMapping("/{orderId}/cancel")
    public ResponseEntity<ApiResponse<OrderResponse>> cancelOrder(
            @PathVariable Long orderId,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new UnauthorizedException("User not found"));
        OrderResponse response = orderService.cancelOrder(orderId, user.getId());
        return ResponseEntity.ok(new ApiResponse<>(true, "Order cancelled successfully", response));
    }

    @GetMapping("/pricing")
    public ResponseEntity<ApiResponse<PricingResponse>> getPricingEstimate(@RequestParam OrderType orderType,
                                                                           @RequestParam Integer pages,
                                                                           @RequestParam Urgency urgency,
                                                                           @RequestParam WorkType workType,
                                                                           @RequestParam(defaultValue = "0") BigDecimal materialCost) {
        PricingResponse response = pricingService.calculatePrice(orderType, pages, urgency, workType, materialCost);
        return ResponseEntity.ok(new ApiResponse<>(true, "Cost matrix updated", response));
    }

    @PostMapping("/{orderId}/rate")
    public ResponseEntity<ApiResponse<?>> rateOrder(
            @PathVariable Long orderId,
            @Valid @RequestBody RatingRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new UnauthorizedException("User not found"));
        orderService.submitRating(orderId, request, user.getId());
        return ResponseEntity.ok(new ApiResponse<>(true, "Rating submitted", null));
    }
}
