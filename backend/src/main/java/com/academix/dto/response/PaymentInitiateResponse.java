package com.academix.dto.response;

import java.math.BigDecimal;

public class PaymentInitiateResponse {
    private String razorpayOrderId;
    private BigDecimal amount;
    private String currency;
    private String keyId;
    private String studentName;
    private String studentEmail;
    private String studentContact;
    private String orderDescription;

    public PaymentInitiateResponse() {}

    public String getRazorpayOrderId() { return razorpayOrderId; }
    public void setRazorpayOrderId(String razorpayOrderId) { this.razorpayOrderId = razorpayOrderId; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getKeyId() { return keyId; }
    public void setKeyId(String keyId) { this.keyId = keyId; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getStudentEmail() { return studentEmail; }
    public void setStudentEmail(String studentEmail) { this.studentEmail = studentEmail; }

    public String getStudentContact() { return studentContact; }
    public void setStudentContact(String studentContact) { this.studentContact = studentContact; }

    public String getOrderDescription() { return orderDescription; }
    public void setOrderDescription(String orderDescription) { this.orderDescription = orderDescription; }
}
