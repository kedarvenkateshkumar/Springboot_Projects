package com.example.ecommerce.repository;

import com.example.ecommerce.entity.Order;
import com.example.ecommerce.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OrderRepository  extends JpaRepository<Order, Long> {
    List<Order> findByUser(User user);

    Optional<Order> findByIdAndUser(Long id , User user);
}
