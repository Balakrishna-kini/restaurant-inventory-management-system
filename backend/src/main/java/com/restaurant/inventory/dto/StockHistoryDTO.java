package com.restaurant.inventory.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StockHistoryDTO {
    private Long id;
    private InventoryItemDTO inventoryItem;
    private String changeType;
    private Double previousQuantity;
    private Double newQuantity;
    private Double changeAmount;
    private String notes;
    private LocalDateTime changedAt;
}
