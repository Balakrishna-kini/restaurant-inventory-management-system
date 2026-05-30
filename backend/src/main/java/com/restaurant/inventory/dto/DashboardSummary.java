package com.restaurant.inventory.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSummary {
    private long totalItems;
    private long lowStockItems;
    private long outOfStockItems;
    private long recentlyUpdatedItems;
    private BigDecimal totalInventoryValue;
    private long expiredItems;
    private long expiresTodayItems;
    private long expiringSoonItems;
}
