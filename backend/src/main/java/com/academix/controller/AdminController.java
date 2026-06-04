package com.academix.controller;

import com.academix.dto.request.AssignWriterRequest;
import com.academix.dto.response.AnalyticsSummaryResponse;
import com.academix.dto.response.ApiResponse;
import com.academix.dto.response.RevenueResponse;
import com.academix.model.Order;
import com.academix.model.User;
import com.academix.model.WriterProfile;
import com.academix.service.AdminService;
import com.academix.service.WriterAssignmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin")
@PreAuthorize("hasRole('ROLE_ADMIN') or hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;
    private final WriterAssignmentService writerAssignmentService;

    public AdminController(AdminService adminService, WriterAssignmentService writerAssignmentService) {
        this.adminService = adminService;
        this.writerAssignmentService = writerAssignmentService;
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<User>>> getAllUsers() {
        List<User> users = adminService.getAllUsers();
        return ResponseEntity.ok(new ApiResponse<>(true, "User matrix retrieved", users));
    }

    @GetMapping("/writers/pending")
    public ResponseEntity<ApiResponse<List<WriterProfile>>> getPendingWriters() {
        List<WriterProfile> writers = adminService.getPendingWriters();
        return ResponseEntity.ok(new ApiResponse<>(true, "Pending writers fetched", writers));
    }

    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<List<Order>>> getAllOrders() {
        List<Order> orders = adminService.getAllOrders();
        return ResponseEntity.ok(new ApiResponse<>(true, "Orders pool synced", orders));
    }

    @GetMapping("/analytics/summary")
    public ResponseEntity<ApiResponse<AnalyticsSummaryResponse>> getAnalytics() {
        AnalyticsSummaryResponse summary = adminService.getGlobalAnalyticsSummary();
        return ResponseEntity.ok(new ApiResponse<>(true, "Global analytics consolidated", summary));
    }

    @GetMapping("/analytics/revenue")
    public ResponseEntity<ApiResponse<List<RevenueResponse>>> getRevenue() {
        List<RevenueResponse> revenue = adminService.getPeriodicRevenueLogs();
        return ResponseEntity.ok(new ApiResponse<>(true, "Revenue streams tracked", revenue));
    }

    @PutMapping("/orders/{orderId}/assign")
    public ResponseEntity<ApiResponse<?>> assignOrder(@PathVariable Long orderId,
                                                      @RequestBody AssignWriterRequest request) {
        writerAssignmentService.assignOrderToWriter(orderId, request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Writer deployment authorized for task queue", null));
    }

    @PutMapping("/writers/{writerId}/verify")
    public ResponseEntity<ApiResponse<?>> verifyWriter(@PathVariable Long writerId,
                                                       @RequestParam(required = false, defaultValue = "APPROVED") String status) {
        adminService.verifyWriterIdentity(writerId, status);
        return ResponseEntity.ok(new ApiResponse<>(true, "Writer operational verification applied", null));
    }
}
