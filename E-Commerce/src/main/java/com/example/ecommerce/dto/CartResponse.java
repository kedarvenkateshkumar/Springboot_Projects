package com.example.ecommerce.dto;

import java.util.List;

public record CartResponse(
        Long cartId,
        List<CartItemResponse> items,
        Double totalPrice
) {}