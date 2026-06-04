package com.academix.controller;

import com.academix.dto.response.ApiResponse;
import com.academix.exception.UnauthorizedException;
import com.academix.model.Invoice;
import com.academix.model.Organization;
import com.academix.model.Plan;
import com.academix.model.User;
import com.academix.repository.UserRepository;
import com.academix.service.SaaSService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/saas")
public class SaaSController {

    private final SaaSService saasService;
    private final UserRepository userRepository;
    private final com.academix.dto.mapper.UserMapper userMapper;

    public SaaSController(SaaSService saasService, UserRepository userRepository, com.academix.dto.mapper.UserMapper userMapper) {
        this.saasService = saasService;
        this.userRepository = userRepository;
        this.userMapper = userMapper;
    }

    @GetMapping("/plans")
    public ResponseEntity<ApiResponse<List<Plan>>> getPlans() {
        List<Plan> plans = saasService.getAllPlans();
        return ResponseEntity.ok(new ApiResponse<>(true, "SaaS subscription tiers retrieved", plans));
    }

    @GetMapping("/organization")
    public ResponseEntity<ApiResponse<Organization>> getOrganization(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new UnauthorizedException("User not found"));
        Organization org = saasService.getOrganizationDetails(user.getId());
        return ResponseEntity.ok(new ApiResponse<>(true, "Organization details retrieved", org));
    }

    @PutMapping("/organization/plan")
    public ResponseEntity<ApiResponse<Organization>> upgradePlan(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam Long planId,
            @RequestParam(defaultValue = "false") boolean isYearly) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new UnauthorizedException("User not found"));
        Organization org = saasService.upgradePlan(user.getId(), planId, isYearly);
        return ResponseEntity.ok(new ApiResponse<>(true, "Subscription updated successfully", org));
    }

    @GetMapping("/invoices")
    public ResponseEntity<ApiResponse<List<Invoice>>> getInvoices(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new UnauthorizedException("User not found"));
        List<Invoice> invoices = saasService.getInvoices(user.getId());
        return ResponseEntity.ok(new ApiResponse<>(true, "Billing invoices retrieved", invoices));
    }

    @GetMapping("/organization/members")
    public ResponseEntity<ApiResponse<List<com.academix.dto.response.UserResponse>>> getOrganizationMembers(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new UnauthorizedException("User not found"));
        List<User> members = saasService.getOrganizationMembers(user.getId());
        List<com.academix.dto.response.UserResponse> responses = members.stream()
                .map(userMapper::toResponse)
                .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(new ApiResponse<>(true, "Organization members retrieved", responses));
    }

    @PostMapping("/organization/members")
    public ResponseEntity<ApiResponse<com.academix.dto.response.UserResponse>> addOrganizationMember(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam String email,
            @RequestParam(required = false, defaultValue = "MEMBER") String role) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new UnauthorizedException("User not found"));
        User addedMember = saasService.addOrganizationMember(user.getId(), email, role);
        return ResponseEntity.ok(new ApiResponse<>(true, "Member added successfully", userMapper.toResponse(addedMember)));
    }

    @GetMapping("/admin/metrics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAdminMetrics() {
        Map<String, Object> metrics = saasService.getAdminSaaSMetrics();
        return ResponseEntity.ok(new ApiResponse<>(true, "SaaS MRR and subscription metrics loaded", metrics));
    }
}
