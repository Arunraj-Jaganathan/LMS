package com.lms.controller;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PaymentRequest {
    private String paymentId;
    private String orderId;
    private String signature;
}
