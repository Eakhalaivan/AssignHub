package com.academix.controller;

import com.academix.dto.response.ApiResponse;
import com.academix.service.PaymentService;
import com.stripe.Stripe;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.net.Webhook;
import com.stripe.param.PaymentIntentCreateParams;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@RestController
public class StripePaymentController {

    private static final Logger log = LoggerFactory.getLogger(StripePaymentController.class);

    private final PaymentService paymentService;

    @Value("${stripe.secret.key}")
    private String stripeSecretKey;

    @Value("${stripe.webhook.secret}")
    private String stripeWebhookSecret;

    public StripePaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/create-payment-intent")
    public ResponseEntity<?> createPaymentIntent(@RequestBody Map<String, Object> request) {
        try {
            Stripe.apiKey = stripeSecretKey;

            long amount = ((Number) request.get("amount")).longValue();
            String currency = (String) request.get("currency");
            Map<String, String> metadata = (Map<String, String>) request.get("metadata");

            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount(amount)
                    .setCurrency(currency)
                    .putAllMetadata(metadata)
                    .setAutomaticPaymentMethods(
                            PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                    .setEnabled(true)
                                    .build()
                    )
                    .build();

            PaymentIntent paymentIntent = PaymentIntent.create(params);

            Map<String, String> response = new HashMap<>();
            response.put("clientSecret", paymentIntent.getClientSecret());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error creating Stripe PaymentIntent", e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PostMapping("/stripe-webhook")
    public ResponseEntity<String> handleStripeWebhook(
            @RequestHeader("Stripe-Signature") String sigHeader,
            @RequestBody String payload) {
        try {
            Event event = Webhook.constructEvent(payload, sigHeader, stripeWebhookSecret);

            log.info("Received Stripe Webhook: {}", event.getType());

            if ("payment_intent.succeeded".equals(event.getType())) {
                PaymentIntent paymentIntent = (PaymentIntent) event.getDataObjectDeserializer().getObject().orElse(null);
                if (paymentIntent != null) {
                    Map<String, String> metadata = paymentIntent.getMetadata();
                    String orderIdStr = metadata.get("orderId");
                    if (orderIdStr != null) {
                        Long orderId = Long.parseLong(orderIdStr);
                        BigDecimal amount = BigDecimal.valueOf(paymentIntent.getAmount()).divide(BigDecimal.valueOf(100));
                        paymentService.confirmStripePayment(orderId, paymentIntent.getId(), amount);
                    }
                }
            } else if ("payment_intent.payment_failed".equals(event.getType())) {
                PaymentIntent paymentIntent = (PaymentIntent) event.getDataObjectDeserializer().getObject().orElse(null);
                if (paymentIntent != null) {
                    log.warn("Payment failed for PaymentIntent: {}", paymentIntent.getId());
                }
            }

            return ResponseEntity.ok("Received");
        } catch (Exception e) {
            log.error("Stripe webhook verification or processing failed", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Webhook error: " + e.getMessage());
        }
    }

    @PostMapping("/orders/{orderId}/paid")
    public ResponseEntity<ApiResponse<?>> markOrderPaid(
            @PathVariable Long orderId,
            @RequestBody Map<String, Object> payload) {
        try {
            String intentId = (String) payload.get("stripePaymentIntentId");
            Number amountNum = (Number) payload.get("amountPaid");
            BigDecimal amount = BigDecimal.valueOf(amountNum.doubleValue());

            paymentService.confirmStripePayment(orderId, intentId, amount);

            return ResponseEntity.ok(new ApiResponse<>(true, "Order payment recorded successfully", null));
        } catch (Exception e) {
            log.error("Failed to record manual Stripe payment confirmation", e);
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }
}
