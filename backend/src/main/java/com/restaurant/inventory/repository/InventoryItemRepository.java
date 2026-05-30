package com.restaurant.inventory.repository;

import com.restaurant.inventory.model.InventoryItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface InventoryItemRepository extends JpaRepository<InventoryItem, Long> {

    // Search by item name (case-insensitive)
    List<InventoryItem> findByNameContainingIgnoreCase(String name);

    // Get all items in a specific category
    List<InventoryItem> findByCategoryId(Long categoryId);

    // Get all items from a specific supplier
    List<InventoryItem> findBySupplierId(Long supplierId);

    // Get items where stock is at or below reorder level (low stock alert)
    @Query("SELECT i FROM InventoryItem i WHERE i.quantityInStock <= i.reorderLevel")
    List<InventoryItem> findLowStockItems();

    // Get items with zero stock (out of stock)
    List<InventoryItem> findByQuantityInStockLessThanEqual(Double quantity);

    // Get expiring soon items (within next 7 days)
    @Query("SELECT i FROM InventoryItem i WHERE i.expiryDate IS NOT NULL AND i.expiryDate <= :targetDate AND i.expiryDate >= :today")
    List<InventoryItem> findExpiringSoonItems(@Param("today") LocalDate today, @Param("targetDate") LocalDate targetDate);

    // Get expired items
    @Query("SELECT i FROM InventoryItem i WHERE i.expiryDate IS NOT NULL AND i.expiryDate < :today")
    List<InventoryItem> findExpiredItems(@Param("today") LocalDate today);
}
