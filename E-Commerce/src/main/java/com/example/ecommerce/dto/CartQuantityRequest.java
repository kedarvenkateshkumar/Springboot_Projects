package com.example.ecommerce.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class CartQuantityRequest {
    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be grater then zero")
    private Integer quantity;

    public Integer getQuantity(){
        return quantity;
    }

    public void setQuantity(Integer qunatity){
        this.quantity = qunatity;
    }
}
