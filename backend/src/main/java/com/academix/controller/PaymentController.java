package com.academix.controller;

import com.academix.dto.request.PaymentVerifyRequest;
import com.academix.dto.response.ApiResponse;
import com.academix.dto.response.PaymentInitiateResponse;
import com.academix.exception.UnauthorizedException;
import com.academix.model.Payment;
import com.academix.model.User;
import com.academix.repository.UserRepository;
import com.academix.service.PaymentService;
import com.academix.service.InvoicePdfService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/payment")
public class PaymentController {

    private static final Logger log = LoggerFactory.getLogger(PaymentController.class);

    private final PaymentService paymentService;
    private final UserRepository userRepository;
    private final InvoicePdfService invoicePdfService;
    private final com.academix.repository.PaymentRepository paymentRepository;

    @Value("${razorpay.key.id}")
    private String keyId;

    public PaymentController(PaymentService paymentService, UserRepository userRepository,
                             InvoicePdfService invoicePdfService,
                             com.academix.repository.PaymentRepository paymentRepository) {
        this.paymentService = paymentService;
        this.userRepository = userRepository;
        this.invoicePdfService = invoicePdfService;
        this.paymentRepository = paymentRepository;
    }

    @PostMapping("/initiate")
    public ResponseEntity<ApiResponse<?>> initiatePayment(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam Long orderId,
            @RequestParam BigDecimal amount) {
        User student = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new UnauthorizedException("User not found"));
                
        Payment pending = paymentService.createPaymentLinkForOrder(orderId, amount, student);

        PaymentInitiateResponse response = new PaymentInitiateResponse();
        response.setRazorpayOrderId(pending.getRazorpayOrderId());
        response.setAmount(pending.getAmount());
        response.setCurrency(pending.getCurrency());
        response.setKeyId(keyId);
        response.setStudentName(student.getName());
        response.setStudentEmail(student.getEmail());
        response.setStudentContact(student.getPhone());
        response.setOrderDescription("Payment for Order #" + orderId);

        return ResponseEntity.ok(new ApiResponse<>(true, "Gateway transaction initiated", response));
    }

    @PostMapping("/verify")
    public ResponseEntity<ApiResponse<?>> verifySignature(@Valid @RequestBody PaymentVerifyRequest request) {
        boolean isValid = paymentService.verifyPaymentSignature(request);
        if (isValid) {
            return ResponseEntity.ok(new ApiResponse<>(true, "Signature verified, funds secure", null));
        } else {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, "Checksum alignment failed", null));
        }
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> handleRazorpayWebhook(
            @RequestHeader("X-Razorpay-Signature") String signature,
            @RequestBody String rawBody) {
        log.info("Received Razorpay Webhook notification");
        boolean valid = paymentService.verifyWebhookSignature(rawBody, signature);
        if (valid) {
            paymentService.processWebhookEvent(rawBody);
            return ResponseEntity.ok("OK");
        } else {
            log.warn("Invalid webhook signature verification payload");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid signature");
        }
    }

    @GetMapping("/invoice/{paymentId}")
    public ResponseEntity<byte[]> downloadInvoice(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long paymentId) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new UnauthorizedException("User not found"));
        
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new com.academix.exception.ResourceNotFoundException("Payment record not found"));

        if (user.getRole() != com.academix.enums.Role.ADMIN && !payment.getStudent().getId().equals(user.getId())) {
            throw new UnauthorizedException("Access Denied: You cannot view this invoice");
        }

        if (payment.getPaymentStatus() != com.academix.enums.PaymentStatus.SUCCESS) {
            throw new com.academix.exception.BadRequestException("Invoices are only generated for successful payments");
        }

        byte[] pdfBytes = invoicePdfService.generateGSTInvoicePdf(payment);

        return ResponseEntity.ok()
                .contentType(org.springframework.http.MediaType.APPLICATION_PDF)
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"invoice-" + paymentId + ".pdf\"")
                .body(pdfBytes);
    }
}
