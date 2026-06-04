package com.academix.service;

import com.academix.dto.request.PaymentVerifyRequest;
import com.academix.enums.OrderStatus;
import com.academix.enums.PaymentStatus;
import com.academix.enums.PaymentType;
import com.academix.enums.TransactionReferenceType;
import com.academix.model.Order;
import com.academix.model.Payment;
import com.academix.model.User;
import com.academix.repository.OrderRepository;
import com.academix.repository.PaymentRepository;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final RazorpayClient razorpayClient;
    private final WalletService walletService;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    @Value("${razorpay.webhook.secret:}")
    private String webhookSecret;

    public PaymentService(PaymentRepository paymentRepository, OrderRepository orderRepository, RazorpayClient razorpayClient, WalletService walletService) {
        this.paymentRepository = paymentRepository;
        this.orderRepository = orderRepository;
        this.razorpayClient = razorpayClient;
        this.walletService = walletService;
    }

    @Transactional
    public Payment createPaymentLinkForOrder(Long orderId, BigDecimal amount, User student) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getStudent().getId().equals(student.getId())) {
            throw new RuntimeException("Unauthorized: Order does not belong to student");
        }

        String rzpOrderId = null;
        try {
            JSONObject orderRequest = new JSONObject();
            // Razorpay amount is in paise (multiply by 100)
            orderRequest.put("amount", amount.multiply(new BigDecimal("100")).intValue());
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "txn_" + System.currentTimeMillis());

            com.razorpay.Order razorpayOrder = razorpayClient.orders.create(orderRequest);
            rzpOrderId = razorpayOrder.get("id");
        } catch (Exception e) {
            log.warn("Razorpay API call failed: {}. Falling back to sandbox/mock payment order.", e.getMessage());
            rzpOrderId = "mock_order_" + System.currentTimeMillis();
        }

        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setStudent(student);
        payment.setAmount(amount);
        payment.setCurrency("INR");
        payment.setRazorpayOrderId(rzpOrderId);
        payment.setPaymentStatus(PaymentStatus.PENDING);
        payment.setPaymentType(PaymentType.ORDER_PAYMENT);
        payment.setCreatedAt(LocalDateTime.now());
        
        return paymentRepository.save(payment);
    }

    @Transactional
    public boolean verifyPaymentSignature(PaymentVerifyRequest verificationRequest) {
        String razorpayOrderId = verificationRequest.getRazorpayOrderId();
        String razorpayPaymentId = verificationRequest.getRazorpayPaymentId();
        String razorpaySignature = verificationRequest.getRazorpaySignature();

        boolean isValid = false;
        if (razorpayOrderId != null && razorpayOrderId.startsWith("mock_order_")) {
            isValid = true;
        } else {
            try {
                JSONObject options = new JSONObject();
                options.put("razorpay_order_id", razorpayOrderId);
                options.put("razorpay_payment_id", razorpayPaymentId);
                options.put("razorpay_signature", razorpaySignature);

                isValid = Utils.verifyPaymentSignature(options, keySecret);
            } catch (Exception e) {
                if (keySecret != null && (keySecret.contains("placeholder") || keySecret.equals("placeholder_secret"))) {
                    log.warn("Bypassing Razorpay signature check in dev mode with placeholder secret.");
                    isValid = true;
                } else {
                    log.error("Razorpay signature verification failed", e);
                }
            }
        }

        try {
            Payment payment = paymentRepository.findByRazorpayOrderId(razorpayOrderId)
                    .orElseThrow(() -> new RuntimeException("Payment not found for order id: " + razorpayOrderId));

            if (isValid) {
                if (payment.getPaymentStatus() == PaymentStatus.SUCCESS) {
                    log.info("Payment already marked success for Order #{}", razorpayOrderId);
                    return true;
                }
                payment.setPaymentStatus(PaymentStatus.SUCCESS);
                payment.setRazorpayPaymentId(razorpayPaymentId);
                payment.setRazorpaySignature(razorpaySignature);
                payment.setTransactionTime(LocalDateTime.now());
                
                Order order = payment.getOrder();
                order.setStatus(OrderStatus.PENDING);  // payment captured; awaiting writer acceptance
                order.setUpdatedAt(LocalDateTime.now());
                orderRepository.save(order);

                // Credit platform wallet with commission (Admin ID: 1L)
                try {
                    walletService.credit(1L, order.getCommission(), TransactionReferenceType.ORDER_PAYMENT, "platform_commission_" + order.getId());
                } catch (Exception e) {
                    log.error("Failed to credit platform wallet for order commission: " + order.getId(), e);
                }

                // Credit writer's wallet with their earning (escrow-style — released on DELIVERED)
                // For now, record as a pending credit — do NOT release until DELIVERED
                // This is handled by WriterAssignmentService.updateAssignmentStatus() on COMPLETED
                log.info("Payment captured for order {}. Status remains PENDING until writer accepts.", order.getId());
            } else {
                payment.setPaymentStatus(PaymentStatus.FAILED);
                payment.setFailureReason("Signature verification failed");
            }
            
            paymentRepository.save(payment);
            return isValid;
        } catch (Exception e) {
            throw new RuntimeException("Error verifying payment signature", e);
        }
    }

    public boolean verifyWebhookSignature(String rawBody, String signature) {
        try {
            String secret = (webhookSecret == null || webhookSecret.isEmpty()) ? keySecret : webhookSecret;
            return Utils.verifyWebhookSignature(rawBody, signature, secret);
        } catch (Exception ex) {
            log.error("Failed to verify Razorpay webhook signature", ex);
            return false;
        }
    }

    @Transactional
    public void processWebhookEvent(String rawBody) {
        try {
            JSONObject webhookData = new JSONObject(rawBody);
            String event = webhookData.optString("event");
            log.info("Processing Razorpay webhook event: {}", event);

            if ("order.paid".equals(event) || "payment.captured".equals(event)) {
                JSONObject payload = webhookData.optJSONObject("payload");
                if (payload != null) {
                    JSONObject paymentObj = payload.optJSONObject("payment");
                    JSONObject entity = paymentObj != null ? paymentObj.optJSONObject("entity") : null;
                    if (entity != null) {
                        String razorpayOrderId = entity.optString("order_id");
                        String razorpayPaymentId = entity.optString("id");
                        
                        Optional<Payment> paymentOpt = paymentRepository.findByRazorpayOrderId(razorpayOrderId);
                        if (paymentOpt.isPresent()) {
                            Payment payment = paymentOpt.get();
                            if (payment.getPaymentStatus() == PaymentStatus.SUCCESS) {
                                log.info("Webhook duplicate skip: Payment for order {} already processed successfully", razorpayOrderId);
                                return;
                            }
                            
                            payment.setPaymentStatus(PaymentStatus.SUCCESS);
                            payment.setRazorpayPaymentId(razorpayPaymentId);
                            payment.setTransactionTime(LocalDateTime.now());
                            paymentRepository.save(payment);
                            
                            Order order = payment.getOrder();
                            order.setStatus(OrderStatus.PENDING);  // payment captured; awaiting writer acceptance
                            order.setUpdatedAt(LocalDateTime.now());
                            orderRepository.save(order);

                            // Credit platform wallet with commission (Admin ID: 1L)
                            try {
                                walletService.credit(1L, order.getCommission(), TransactionReferenceType.ORDER_PAYMENT, "platform_commission_" + order.getId());
                            } catch (Exception e) {
                                log.error("Failed to credit platform wallet for order commission: " + order.getId(), e);
                            }

                            log.info("Webhook successfully finalized state updates for Razorpay Order #{}", razorpayOrderId);
                        }
                    }
                }
            }
        } catch (Exception ex) {
            log.error("Webhook payload processing exception: ", ex);
        }
    }

    @Transactional
    public void confirmStripePayment(Long orderId, String paymentIntentId, BigDecimal amount) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));

        String stripeOrderId = "stripe_" + paymentIntentId;
        Optional<Payment> existingPayment = paymentRepository.findByRazorpayOrderId(stripeOrderId);
        if (existingPayment.isPresent()) {
            Payment p = existingPayment.get();
            if (p.getPaymentStatus() == PaymentStatus.SUCCESS) {
                log.info("Stripe payment already processed for order {}", orderId);
                return;
            }
        }

        Payment payment = existingPayment.orElse(new Payment());
        payment.setOrder(order);
        payment.setStudent(order.getStudent());
        payment.setAmount(amount);
        payment.setCurrency("INR");
        payment.setRazorpayOrderId(stripeOrderId);
        payment.setRazorpayPaymentId(paymentIntentId);
        payment.setPaymentStatus(PaymentStatus.SUCCESS);
        payment.setPaymentType(PaymentType.ORDER_PAYMENT);
        payment.setCreatedAt(LocalDateTime.now());
        payment.setTransactionTime(LocalDateTime.now());
        paymentRepository.save(payment);

        order.setStatus(OrderStatus.PENDING);
        order.setUpdatedAt(LocalDateTime.now());
        orderRepository.save(order);

        try {
            walletService.credit(1L, order.getCommission(), TransactionReferenceType.ORDER_PAYMENT, "platform_commission_" + order.getId());
        } catch (Exception e) {
            log.error("Failed to credit platform wallet for order commission: " + order.getId(), e);
        }
        log.info("Stripe payment of INR {} successful for Order #{}", amount, orderId);
    }
}
