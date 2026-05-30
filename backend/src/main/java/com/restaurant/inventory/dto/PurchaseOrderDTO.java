package com.restaurant.inventory.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseOrderDTO {
    private Long id;
    private String orderNumber;
    private InventoryItemDTO inventoryItem;
    private SupplierDTO supplier;
    private Double quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
    private String status;
    private String notes;
    private LocalDateTime orderDate;
    private LocalDateTime updatedAt;
}
