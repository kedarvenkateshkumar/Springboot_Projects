package com.example.ecommerce.service;

import com.example.ecommerce.dto.CartItemRequest;
import com.example.ecommerce.dto.CartItemResponse;
import com.example.ecommerce.dto.CartQuantityRequest;
import com.example.ecommerce.dto.CartResponse;
import com.example.ecommerce.entity.Cart;
import com.example.ecommerce.entity.CartItem;
import com.example.ecommerce.entity.Product;
import com.example.ecommerce.entity.User;
import com.example.ecommerce.exception.ResourceNotFoundException;
import com.example.ecommerce.repository.CartItemRepository;
import com.example.ecommerce.repository.CartRepository;
import com.example.ecommerce.repository.ProductRepository;
import com.example.ecommerce.repository.UserRepo;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepo userRepo;

    public CartService(
            CartRepository cartRepository,
            CartItemRepository cartItemRepository,
            ProductRepository productRepository,
            UserRepo userRepo) {

        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this    .productRepository = productRepository;
        this.userRepo = userRepo;
    }

    @Transactional
    public CartResponse addToCart(
            CartItemRequest request,
            Authentication authentication) {

        User user = getAuthenticatedUser(authentication);

        Cart cart = cartRepository.findByUser(user)
                .orElseGet(() -> {
                    Cart newCart = new Cart();
                    newCart.setUser(user);
                    return cartRepository.save(newCart);
                });

        Product product = productRepository
                .findById(request.getProductId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Product not found with id: "
                                        + request.getProductId()
                        ));

        CartItem item = cartItemRepository
                .findByCartAndProduct(cart, product)
                .orElseGet(() -> {
                    CartItem newItem = new CartItem();
                    newItem.setCart(cart);
                    newItem.setProduct(product);
                    newItem.setQuantity(0);
                    return newItem;
                });

        // Current quantity already present in cart
        int currentCartQuantity = item.getQuantity();

        // Quantity requested by user
        int requestedQuantity = request.getQuantity();

        // Calculate final quantity
        int newQuantity;

        try {
            newQuantity = Math.addExact(
                    currentCartQuantity,
                    requestedQuantity
            );
        } catch (ArithmeticException ex) {
            throw new IllegalArgumentException(
                    "Quantity is too large"
            );
        }

        // Check stock
        if (newQuantity > product.getQuantity()) {
            throw new IllegalArgumentException(
                    "Insufficient stock. Available stock: "
                            + product.getQuantity()
            );
        }

        // Update cart quantity
        item.setQuantity(newQuantity);

        CartItem savedItem = cartItemRepository.save(item);

        // Add newly created item to cart's list
        if (item.getId() == null) {
            cart.getItems().add(savedItem);
        }

        return buildCartResponse(cart);
    }

    @Transactional(readOnly = true)
    public CartResponse getMyCart(Authentication authentication) {

        User user = getAuthenticatedUser(authentication);

        return cartRepository.findByUser(user)
                .map(this::buildCartResponse)
                .orElseGet(() ->
                        new CartResponse(
                                null,
                                List.of(),
                                0.0
                        ));
    }

    private User getAuthenticatedUser(
            Authentication authentication) {

        if (authentication == null
                || !authentication.isAuthenticated()) {
            throw new org.springframework.security
                    .access.AccessDeniedException(
                    "Authentication required"
            );
        }

        return userRepo
                .findByUsername(authentication.getName())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Authenticated user not found"
                        ));
    }

    private CartResponse buildCartResponse(Cart cart) {

        List<CartItemResponse> items = cart.getItems()
                .stream()
                .map(item -> {

                    Product product = item.getProduct();

                    return new CartItemResponse(
                            item.getId(),
                            product.getId(),
                            product.getName(),
                            product.getPrice(),
                            item.getQuantity(),
                            product.getPrice()
                                    * item.getQuantity()
                    );
                })
                .toList();

        double total = items.stream()
                .mapToDouble(CartItemResponse::subtotal)
                .sum();

        return new CartResponse(
                cart.getId(),
                items,
                total
        );
    }

    @Transactional
    public  CartResponse updateCartItem(
            Long cartItemId,
            CartQuantityRequest request,
            Authentication authentication){
        User user = getAuthenticatedUser(authentication);

        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("user not found"));
        CartItem cartItem = cartItemRepository.findByIdAndCart(cartItemId , cart)
                .orElseThrow(() -> new ResourceNotFoundException("User cart is not found"));
        Product product = cartItem.getProduct();

        if(request.getQuantity() > product.getQuantity()){
            throw new IllegalArgumentException(
                    "Insufficent qunatity, Avialble stock: "
                    +product.getQuantity()
            );
        }
        cartItem.setQuantity(request.getQuantity());

        cartItemRepository.save(cartItem);

        return buildCartResponse(cart);
    }
}