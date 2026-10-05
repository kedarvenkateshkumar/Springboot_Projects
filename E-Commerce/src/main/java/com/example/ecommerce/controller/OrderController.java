package com.example.ecommerce.controller;

import com.example.ecommerce.dto.OrderResponse;
import com.example.ecommerce.dto.UpdateOrderStatusRequest;
import com.example.ecommerce.service.OrderService;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(
            Authentication authentication) {

        OrderResponse response =
                orderService.createOrder(authentication);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping
    public ResponseEntity<List<OrderResponse>> getMyOrders(
            Authentication authentication) {

        return ResponseEntity.ok(
                orderService.getMyOrders(authentication)
        );
    }
    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponse> getOrderById(
            @PathVariable Long orderId,
            Authentication authentication) {

        return ResponseEntity.ok(
                orderService.getOrderById(
                        orderId,
                        authentication
                )
        );
    }
    @PutMapping("/{orderId}/cancel")
    public ResponseEntity<OrderResponse> cancelOrder(
            @PathVariable Long orderId,
            Authentication authentication) {

        return ResponseEntity.ok(
                orderService.cancelOrder(
                        orderId,
                        authentication
                )
        );
    }

    @PutMapping("/{orderId}/status")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable Long orderId,
            @Valid @RequestBody UpdateOrderStatusRequest request) throws IllegalAccessException {

        return ResponseEntity.ok(
                orderService.updateOrderStatus(
                        orderId,
                        request
                )
        );
    }
    @GetMapping("/admin")
    public ResponseEntity<List<OrderResponse>> getAllOrders() {

        return ResponseEntity.ok(
                orderService.getAllOrders()
        );
    }
}