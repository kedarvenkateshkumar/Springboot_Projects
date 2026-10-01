package com.example.ecommerce.controller;

import com.example.ecommerce.dto.ProductRequest;
import com.example.ecommerce.dto.ProductResponse;
import com.example.ecommerce.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @PostMapping
    public ResponseEntity<ProductResponse> createProduct(
            @Valid @RequestBody ProductRequest request) {

        ProductResponse created = productService.createProduct(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(created);
    }

    @GetMapping
    public ResponseEntity<List<ProductResponse>> getAllProducts() {

        return ResponseEntity.ok(
                productService.getAllProducts()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProductById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                productService.getProductById(id)
        );
    }

    @GetMapping("/search")
    public ResponseEntity<List<ProductResponse>> searchProducts(
            @RequestParam String name) {

        return ResponseEntity.ok(
                productService.searchProducts(name)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductRequest request) {

        return ResponseEntity.ok(
                productService.updateProduct(id, request)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteProduct(
            @PathVariable Long id) {

        productService.deleteProduct(id);

        return ResponseEntity.ok(
                "Product deleted successfully"
        );
    }
}