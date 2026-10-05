package com.example.ecommerce.dto;

import com.example.ecommerce.entity.OrderStatus;

import java.time.LocalDateTime;
import java.util.List;

public record OrderResponse(
        Long orderId,
        OrderStatus status,
        Double totalAmount,
        LocalDateTime createdAt,
        List<OrderItemResponse> items
) {
}