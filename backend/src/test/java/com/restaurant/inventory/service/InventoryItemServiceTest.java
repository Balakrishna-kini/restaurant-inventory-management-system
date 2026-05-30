package com.restaurant.inventory.service;

import com.restaurant.inventory.model.InventoryItem;
import com.restaurant.inventory.repository.InventoryItemRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

public class InventoryItemServiceTest {

    @Mock
    private InventoryItemRepository inventoryItemRepository;

    @Mock
    private StockHistoryService stockHistoryService;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private InventoryItemService inventoryItemService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testStockIncrease() {
        InventoryItem item = new InventoryItem();
        item.setId(1L);
        item.setQuantityInStock(50.0);

        when(inventoryItemRepository.findById(1L)).thenReturn(Optional.of(item));
        when(inventoryItemRepository.save(any())).thenReturn(item);

        inventoryItemService.updateStock(1L, 70.0, "Restock");

        assertEquals(70.0, item.getQuantityInStock());
        verify(stockHistoryService, times(1)).logChange(eq(item), eq(com.restaurant.inventory.model.StockHistory.ChangeType.ADDED), eq(50.0), eq(70.0), eq("Restock"));
    }

    @Test
    void testStockReduction() {
        InventoryItem item = new InventoryItem();
        item.setId(1L);
        item.setQuantityInStock(50.0);
        item.setReorderLevel(10.0);

        when(inventoryItemRepository.findById(1L)).thenReturn(Optional.of(item));
        when(inventoryItemRepository.save(any())).thenReturn(item);

        inventoryItemService.reduceStock(1L, 10.0, "Used in kitchen");

        assertEquals(40.0, item.getQuantityInStock());
        verify(stockHistoryService, times(1)).logChange(eq(item), eq(com.restaurant.inventory.model.StockHistory.ChangeType.REDUCED), eq(50.0), eq(40.0), eq("Used in kitchen"));
    }
}
