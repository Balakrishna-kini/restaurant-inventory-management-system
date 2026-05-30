package com.restaurant.inventory.service;

import com.restaurant.inventory.model.InventoryItem;
import com.restaurant.inventory.model.StockHistory;
import com.restaurant.inventory.repository.StockHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StockHistoryService {

    private final StockHistoryRepository stockHistoryRepository;

    // Get all history (newest first)
    public List<StockHistory> getAllHistory() {
        return stockHistoryRepository.findAllByOrderByChangedAtDesc();
    }

    // Get history for one specific item
    public List<StockHistory> getHistoryByItem(Long itemId) {
        return stockHistoryRepository.findByInventoryItemIdOrderByChangedAtDesc(itemId);
    }

    // Get history by change type
    public List<StockHistory> getHistoryByType(StockHistory.ChangeType changeType) {
        return stockHistoryRepository.findByChangeTypeOrderByChangedAtDesc(changeType);
    }

    // Log a stock change (called from other services)
    public StockHistory logChange(InventoryItem item, StockHistory.ChangeType changeType,
                                   Double previousQty, Double newQty, String notes) {
        StockHistory history = new StockHistory();
        history.setInventoryItem(item);
        history.setChangeType(changeType);
        history.setPreviousQuantity(previousQty);
        history.setNewQuantity(newQty);
        history.setChangeAmount(newQty - previousQty);
        history.setNotes(notes);
        return stockHistoryRepository.save(history);
    }
}
