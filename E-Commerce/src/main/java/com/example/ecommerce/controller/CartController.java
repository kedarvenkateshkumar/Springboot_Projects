package com.example.ecommerce.controller;

import com.example.ecommerce.dto.CartItemRequest;
import com.example.ecommerce.dto.CartQuantityRequest;
import com.example.ecommerce.dto.CartResponse;
import com.example.ecommerce.service.CartService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @PostMapping("/items")
    public ResponseEntity<CartResponse> addToCart(
            @Valid @RequestBody CartItemRequest request,
            Authentication authentication) {

        return ResponseEntity.ok(
                cartService.addToCart(request, authentication)
        );
    }

    @GetMapping
    public ResponseEntity<CartResponse> getMyCart(
            Authentication authentication) {

        return ResponseEntity.ok(
                cartService.getMyCart(authentication)
        );
    }

    @PutMapping("/items/{cartItemId}")
    public ResponseEntity<CartResponse> updateCartItem(
            @PathVariable Long cartItemId,
            @Valid @RequestBody CartQuantityRequest request,
            Authentication authentication) {

        return ResponseEntity.ok(
                cartService.updateCartItem(
                        cartItemId,
                        request,
                        authentication
                )
        );
    }
}