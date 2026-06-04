package com.academix.service;

import com.academix.exception.BadRequestException;
import com.academix.exception.ResourceNotFoundException;
import com.academix.model.Invoice;
import com.academix.model.Organization;
import com.academix.model.Plan;
import com.academix.model.User;
import com.academix.repository.InvoiceRepository;
import com.academix.repository.OrganizationRepository;
import com.academix.repository.PlanRepository;
import com.academix.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class SaaSService {

    private final PlanRepository planRepository;
    private final OrganizationRepository organizationRepository;
    private final InvoiceRepository invoiceRepository;
    private final UserRepository userRepository;

    public SaaSService(PlanRepository planRepository,
                      OrganizationRepository organizationRepository,
                      InvoiceRepository invoiceRepository,
                      UserRepository userRepository) {
        this.planRepository = planRepository;
        this.organizationRepository = organizationRepository;
        this.invoiceRepository = invoiceRepository;
        this.userRepository = userRepository;
    }

    public List<Plan> getAllPlans() {
        return planRepository.findAll();
    }

    public Organization getOrganizationDetails(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return user.getOrganization();
    }

    @Transactional
    public Organization upgradePlan(Long userId, Long planId, boolean isYearly) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Plan plan = planRepository.findById(planId)
                .orElseThrow(() -> new ResourceNotFoundException("Plan not found"));

        // Create or get organization
        Organization org = user.getOrganization();
        if (org == null) {
            org = new Organization();
            org.setName(user.getName() + "'s Org");
            org.setDomain(user.getEmail().substring(user.getEmail().indexOf("@") + 1));
            org.setPlan(plan);
            org.setSubscriptionStatus("ACTIVE");
            org = organizationRepository.save(org);

            user.setOrganization(org);
            user.setRoleInOrg("ADMIN");
            userRepository.save(user);
        } else {
            org.setPlan(plan);
            org.setSubscriptionStatus("ACTIVE");
        }

        // Set expiration
        LocalDateTime expiresAt = isYearly ? LocalDateTime.now().plusYears(1) : LocalDateTime.now().plusMonths(1);
        org.setSubscriptionExpiresAt(expiresAt);
        Organization savedOrg = organizationRepository.save(org);

        // Update user plan to match
        user.setPlan(plan);
        userRepository.save(user);

        // Generate Invoice
        BigDecimal price = isYearly ? plan.getPriceYearly() : plan.getPriceMonthly();
        Invoice invoice = new Invoice();
        invoice.setOrganization(savedOrg);
        invoice.setAmount(price);
        invoice.setStatus("PAID");
        invoice.setBillingPeriodStart(LocalDateTime.now());
        invoice.setBillingPeriodEnd(expiresAt);
        invoiceRepository.save(invoice);

        return savedOrg;
    }

    public List<Invoice> getInvoices(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Organization org = user.getOrganization();
        if (org == null) {
            return new ArrayList<>();
        }

        return invoiceRepository.findByOrganizationIdOrderByCreatedAtDesc(org.getId());
    }

    public Map<String, Object> getAdminSaaSMetrics() {
        List<Organization> orgs = organizationRepository.findAll();

        long activePaidCount = orgs.stream()
                .filter(o -> "ACTIVE".equalsIgnoreCase(o.getSubscriptionStatus()))
                .filter(o -> !"FREE".equalsIgnoreCase(o.getPlan().getName()))
                .count();

        BigDecimal mrr = orgs.stream()
                .filter(o -> "ACTIVE".equalsIgnoreCase(o.getSubscriptionStatus()))
                .filter(o -> !"FREE".equalsIgnoreCase(o.getPlan().getName()))
                .map(o -> o.getPlan().getPriceMonthly())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Long> tierDistribution = orgs.stream()
                .collect(Collectors.groupingBy(o -> o.getPlan().getName(), Collectors.counting()));

        tierDistribution.putIfAbsent("FREE", 0L);
        tierDistribution.putIfAbsent("PRO", 0L);
        tierDistribution.putIfAbsent("ENTERPRISE", 0L);

        long totalOrgs = orgs.size();
        long churnedOrgs = orgs.stream()
                .filter(o -> "INACTIVE".equalsIgnoreCase(o.getSubscriptionStatus()) || "CANCELLED".equalsIgnoreCase(o.getSubscriptionStatus()))
                .count();

        double churnRate = totalOrgs == 0 ? 0.0 : ((double) churnedOrgs / totalOrgs) * 100;

        Map<String, Object> metrics = new HashMap<>();
        metrics.put("mrr", mrr);
        metrics.put("activeSubscriptions", activePaidCount);
        metrics.put("tierDistribution", tierDistribution);
        metrics.put("churnRate", Math.round(churnRate * 100.0) / 100.0);
        metrics.put("totalOrganizations", totalOrgs);

        return metrics;
    }

    public List<User> getOrganizationMembers(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Organization org = user.getOrganization();
        if (org == null) {
            throw new BadRequestException("User does not belong to an organization");
        }
        return userRepository.findByOrganizationId(org.getId());
    }

    @Transactional
    public User addOrganizationMember(Long userId, String email, String roleInOrg) {
        User requester = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Requester not found"));
        
        Organization org = requester.getOrganization();
        if (org == null) {
            throw new BadRequestException("Requester does not belong to an organization");
        }

        if (!"ADMIN".equalsIgnoreCase(requester.getRoleInOrg())) {
            throw new BadRequestException("Only organization administrators can add members");
        }

        // Enforce seat limits
        List<User> currentMembers = userRepository.findByOrganizationId(org.getId());
        Plan plan = org.getPlan();
        if (plan != null && currentMembers.size() >= plan.getMaxSeats()) {
            throw new BadRequestException("Organization seat limit reached (" + plan.getMaxSeats() + " seats) under your " + plan.getName() + " plan. Please upgrade.");
        }

        User targetUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User with email " + email + " not found."));

        if (targetUser.getOrganization() != null) {
            throw new BadRequestException("User already belongs to an organization: " + targetUser.getOrganization().getName());
        }

        targetUser.setOrganization(org);
        targetUser.setRoleInOrg(roleInOrg == null ? "MEMBER" : roleInOrg);
        targetUser.setPlan(plan); // Inherits plan
        return userRepository.save(targetUser);
    }
}
