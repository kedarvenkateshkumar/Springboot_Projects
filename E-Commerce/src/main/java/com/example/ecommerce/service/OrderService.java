package com.example.ecommerce.service;

import com.example.ecommerce.dto.OrderItemResponse;
import com.example.ecommerce.dto.OrderResponse;
import com.example.ecommerce.entity.Cart;
import com.example.ecommerce.entity.CartItem;
import com.example.ecommerce.entity.Order;
import com.example.ecommerce.entity.OrderItem;
import com.example.ecommerce.entity.OrderStatus;
import com.example.ecommerce.entity.Product;
import com.example.ecommerce.entity.User;
import com.example.ecommerce.exception.ResourceNotFoundException;
import com.example.ecommerce.repository.*;

import org.hibernate.engine.query.spi.OrdinalParameterDescriptor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepo userRepository;

    public OrderService(
            OrderRepository orderRepository,
            OrderItemRepository orderItemRepository,
            CartRepository cartRepository,
            CartItemRepository cartItemRepository,
            ProductRepository productRepository,
            UserRepo userRepository) {

        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public OrderResponse createOrder(Authentication authentication) {

        // 1. Get logged-in user
        User user = getAuthenticatedUser(authentication);

        // 2. Find user's cart
        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Cart not found"
                        ));

        // 3. Check whether cart is empty
        if (cart.getItems().isEmpty()) {
            throw new IllegalArgumentException(
                    "Cannot create order. Cart is empty"
            );
        }

        // 4. Create new Order
        Order order = new Order();

        order.setUser(user);
        order.setStatus(OrderStatus.PENDING);
        order.setCreatedAt(LocalDateTime.now());
        order.setTotalAmount(0.0);

        // This will contain OrderItems,
        // NOT CartItems
        List<OrderItem> orderItems = new ArrayList<>();

        double totalAmount = 0.0;

        // 5. Convert each CartItem into an OrderItem
        for (CartItem cartItem : cart.getItems()) {

            Product product = cartItem.getProduct();

            int requestedQuantity = cartItem.getQuantity();

            // 6. Check product stock again
            if (requestedQuantity > product.getQuantity()) {

                throw new IllegalArgumentException(
                        "Insufficient stock for product: "
                                + product.getName()
                                + ". Available stock: "
                                + product.getQuantity()
                );
            }

            // 7. Take price snapshot
            double price = product.getPrice();

            // 8. Calculate subtotal
            double subtotal = price * requestedQuantity;

            totalAmount += subtotal;

            // 9. Create OrderItem
            OrderItem orderItem = new OrderItem();

            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setQuantity(requestedQuantity);
            orderItem.setPrice(price);

            // Add OrderItem to the OrderItem list
            orderItems.add(orderItem);

            // 10. Reduce product stock
            product.setQuantity(
                    product.getQuantity() - requestedQuantity
            );

            productRepository.save(product);
        }

        // 11. Set final order total
        order.setTotalAmount(totalAmount);

        // 12. Attach OrderItems to Order
        order.setItems(orderItems);

        // 13. Save Order
        Order savedOrder = orderRepository.save(order);

        // 14. Save OrderItems
        orderItemRepository.saveAll(orderItems);

        // 15. Clear the cart
        cartItemRepository.deleteAll(cart.getItems());
        cart.getItems().clear();

        // 16. Return OrderResponse
        return convertToResponse(savedOrder);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getMyOrders(
            Authentication authentication) {

        User user = getAuthenticatedUser(authentication);

        List<Order> orders = orderRepository.findByUser(user);

        return orders.stream()
                .map(this::convertToResponse)
                .toList();
    }

    private User getAuthenticatedUser(
            Authentication authentication) {

        User user = userRepository
                .findByUsername(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user == null) {
            throw new ResourceNotFoundException(
                    "Authenticated user not found"
            );
        }

        return user;
    }

    private OrderResponse convertToResponse(Order order) {

        List<OrderItemResponse> items =
                order.getItems()
                        .stream()
                        .map(item -> {

                            Product product =
                                    item.getProduct();

                            double subtotal =
                                    item.getProduct().getPrice()
                                            * item.getQuantity();

                            return new OrderItemResponse(
                                    item.getId(),
                                    product.getId(),
                                    product.getName(),
                                    item.getQuantity(),
                                    item.getProduct().getPrice(),
                                    subtotal
                            );
                        })
                        .toList();

        return new OrderResponse(
                order.getId(),
                order.getStatus(),
                order.getTotalAmount(),
                order.getCreatedAt(),
                items
        );
    }

    @Transactional
    public OrderResponse getOrderById(
            Long orderId,
            Authentication authentication
    ){
        User user = getAuthenticatedUser(authentication);

        Order order = orderRepository.findByIdAndUser(orderId , user)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Order not found with id: " + orderId
                ));

        return convertToResponse(order);
    }
}