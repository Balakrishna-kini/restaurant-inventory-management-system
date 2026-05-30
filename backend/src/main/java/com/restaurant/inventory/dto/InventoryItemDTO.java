package com.restaurant.inventory.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InventoryItemDTO {
    private Long id;
    private String name;
    private String description;
    private String unit;
    private Double quantityInStock;
    private Double reorderLevel;
    private BigDecimal unitPrice;
    private LocalDate expiryDate;
    private CategoryDTO category;
    private SupplierDTO supplier;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
