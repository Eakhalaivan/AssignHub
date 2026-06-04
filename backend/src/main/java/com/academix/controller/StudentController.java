package com.academix.controller;

import com.academix.dto.request.UpdateProfileRequest;
import com.academix.dto.response.ApiResponse;
import com.academix.dto.response.StudentDashboardResponse;
import com.academix.exception.UnauthorizedException;
import com.academix.model.User;
import com.academix.repository.UserRepository;
import com.academix.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/student")
@PreAuthorize("hasRole('STUDENT')")
public class StudentController {

    private final OrderService orderService;
    private final UserRepository userRepository;

    public StudentController(OrderService orderService, UserRepository userRepository) {
        this.orderService = orderService;
        this.userRepository = userRepository;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<StudentDashboardResponse>> getStudentDashboard(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new UnauthorizedException("User not found"));
        StudentDashboardResponse dashboard = orderService.getStudentDashboard(user.getId());
        return ResponseEntity.ok(new ApiResponse<>(true, "Dashboard loaded", dashboard));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<?>> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UpdateProfileRequest request) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new UnauthorizedException("User not found"));
        orderService.updateStudentProfile(user.getId(), request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Profile updated successfully", null));
    }
}
