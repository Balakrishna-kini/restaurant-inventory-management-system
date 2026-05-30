package com.restaurant.inventory.service;

import com.restaurant.inventory.dto.DashboardSummary;
import com.restaurant.inventory.model.InventoryItem;
import com.restaurant.inventory.repository.InventoryItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class DashboardService {

    @Autowired
    private InventoryItemRepository inventoryRepository;

    public DashboardSummary getSummary() {
        List<InventoryItem> items = inventoryRepository.findAll();
        
        long totalItems = items.size();
        long lowStock = 0;
        long outOfStock = 0;
        long recentlyUpdated = 0;
        BigDecimal totalValue = BigDecimal.ZERO;
        
        long expired = 0;
        long expiresToday = 0;
        long expiringSoon = 0;

        LocalDate today = LocalDate.now();
        LocalDateTime recentThreshold = LocalDateTime.now().minusDays(1);

        for (InventoryItem item : items) {
            // Value
            double qty = item.getQuantityInStock();
            BigDecimal price = item.getUnitPrice();
            if (qty > 0 && price != null) {
                totalValue = totalValue.add(price.multiply(BigDecimal.valueOf(qty)));
            }

            // Stock
            if (qty <= 0) {
                outOfStock++;
            } else if (qty <= item.getReorderLevel()) {
                lowStock++;
            }

            // Recently updated
            if (item.getUpdatedAt() != null && item.getUpdatedAt().isAfter(recentThreshold)) {
                recentlyUpdated++;
            }

            // Expiry
            if (item.getExpiryDate() != null) {
                long days = ChronoUnit.DAYS.between(today, item.getExpiryDate());
                if (days < 0) {
                    expired++;
                } else if (days == 0) {
                    expiresToday++;
                } else if (days > 0 && days <= 7) {
                    expiringSoon++;
                }
            }
        }

        return new DashboardSummary(
                totalItems,
                lowStock,
                outOfStock,
                recentlyUpdated,
                totalValue,
                expired,
                expiresToday,
                expiringSoon
        );
    }
}
