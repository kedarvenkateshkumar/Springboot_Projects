package com.example.ecommerce.dto;

public record OrderItemResponse(
        Long id,
        Long productId,
        String productName,
        Integer quantity,
        Double price,
        Double subtotal
) {
}