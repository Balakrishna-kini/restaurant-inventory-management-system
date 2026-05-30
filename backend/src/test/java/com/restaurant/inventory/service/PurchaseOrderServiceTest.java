package com.restaurant.inventory.service;

import com.restaurant.inventory.model.InventoryItem;
import com.restaurant.inventory.model.PurchaseOrder;
import com.restaurant.inventory.repository.InventoryItemRepository;
import com.restaurant.inventory.repository.PurchaseOrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

public class PurchaseOrderServiceTest {

    @Mock
    private PurchaseOrderRepository purchaseOrderRepository;

    @Mock
    private InventoryItemRepository inventoryItemRepository;

    @Mock
    private StockHistoryService stockHistoryService;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private PurchaseOrderService purchaseOrderService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testWeightedAverageCostOnReceive() {
        // Current Stock: Qty = 50, Price = 30
        InventoryItem item = new InventoryItem();
        item.setId(1L);
        item.setQuantityInStock(50.0);
        item.setUnitPrice(new BigDecimal("30"));

        // New PO: Qty = 50, Price = 50
        PurchaseOrder po = new PurchaseOrder();
        po.setId(100L);
        po.setInventoryItem(item);
        po.setQuantity(50.0);
        po.setUnitPrice(new BigDecimal("50"));
        po.setStatus(PurchaseOrder.OrderStatus.APPROVED);

        when(purchaseOrderRepository.findById(100L)).thenReturn(Optional.of(po));
        when(inventoryItemRepository.save(any())).thenReturn(item);

        // Mock ApplicationContext to return InventoryItemService
        org.springframework.context.ApplicationContext applicationContext = mock(org.springframework.context.ApplicationContext.class);
        InventoryItemService inventoryItemService = mock(InventoryItemService.class);
        when(applicationContext.getBean(InventoryItemService.class)).thenReturn(inventoryItemService);
        
        // We need to set the application context field on PurchaseOrderService
        org.springframework.test.util.ReflectionTestUtils.setField(purchaseOrderService, "applicationContext", applicationContext);

        purchaseOrderService.updateOrderStatus(100L, PurchaseOrder.OrderStatus.RECEIVED, null);

        // Expected New Price: ((50 * 30) + (50 * 50)) / 100 = 40
        assertEquals(PurchaseOrder.OrderStatus.RECEIVED, po.getStatus());
        assertEquals(100.0, item.getQuantityInStock());
        assertEquals(0, new BigDecimal("40").compareTo(item.getUnitPrice()));
        
        verify(inventoryItemRepository, times(1)).save(item);
        verify(purchaseOrderRepository, times(1)).save(po);
    }
}
