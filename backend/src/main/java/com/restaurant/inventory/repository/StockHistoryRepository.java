package com.restaurant.inventory.repository;

import com.restaurant.inventory.model.StockHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StockHistoryRepository extends JpaRepository<StockHistory, Long> {

    // Get all history for a specific item, newest first
    List<StockHistory> findByInventoryItemIdOrderByChangedAtDesc(Long itemId);

    // Get all history, newest first
    List<StockHistory> findAllByOrderByChangedAtDesc();

    // Get history by change type
    List<StockHistory> findByChangeTypeOrderByChangedAtDesc(StockHistory.ChangeType changeType);
}
