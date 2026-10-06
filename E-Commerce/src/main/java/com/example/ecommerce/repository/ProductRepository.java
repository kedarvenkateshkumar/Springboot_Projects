package com.example.ecommerce.repository;

import com.example.ecommerce.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product,Long> {

    Page<Product> findByNameContainingIgnoringCase(
            String name,
            Pageable pageable
    );

    List<Product> findByQuantityLessThanEqual(Integer quantity);
}
