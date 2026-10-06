package com.example.ecommerce.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public class StockUpdateRequest {

    @NotNull(message = "Quantity is required")
    @PositiveOrZero(message = "the stock should grater that zero")
    private Integer quantity;

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
}
