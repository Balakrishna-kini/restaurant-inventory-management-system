package com.restaurant.inventory.service;

import com.restaurant.inventory.exception.ResourceNotFoundException;
import com.restaurant.inventory.model.InventoryItem;
import com.restaurant.inventory.model.PurchaseOrder;
import com.restaurant.inventory.model.StockHistory;
import com.restaurant.inventory.model.Supplier;
import com.restaurant.inventory.repository.InventoryItemRepository;
import com.restaurant.inventory.repository.PurchaseOrderRepository;
import com.restaurant.inventory.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PurchaseOrderService {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final InventoryItemRepository inventoryItemRepository;
    private final SupplierRepository supplierRepository;
    private final StockHistoryService stockHistoryService;
    private final NotificationService notificationService;
    private final org.springframework.context.ApplicationContext applicationContext;

    // Get all orders
    public List<PurchaseOrder> getAllOrders() {
        return purchaseOrderRepository.findAll();
    }

    // Get order by ID
    public PurchaseOrder getOrderById(Long id) {
        return purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PurchaseOrder", "id", id));
    }

    // Get orders by status (PENDING, APPROVED, RECEIVED, CANCELLED)
    public List<PurchaseOrder> getOrdersByStatus(PurchaseOrder.OrderStatus status) {
        return purchaseOrderRepository.findByStatus(status);
    }

    // Get orders by supplier
    public List<PurchaseOrder> getOrdersBySupplier(Long supplierId) {
        return purchaseOrderRepository.findBySupplierId(supplierId);
    }

    // Create new purchase order
    public PurchaseOrder createOrder(PurchaseOrder order, Long itemId, Long supplierId) {
        InventoryItem item = inventoryItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("InventoryItem", "id", itemId));
        order.setInventoryItem(item);

        Supplier supplier = supplierRepository.findById(supplierId)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", supplierId));
        order.setSupplier(supplier);

        PurchaseOrder saved = purchaseOrderRepository.save(order);
        notificationService.createNotification("Purchase Order " + saved.getOrderNumber() + " created.", "PO_CREATED");
        return saved;
    }

    // Update order status
    public PurchaseOrder updateOrderStatus(Long id, PurchaseOrder.OrderStatus newStatus, String newExpiryDate) {
        PurchaseOrder order = getOrderById(id);
        order.setStatus(newStatus);

        // If order is received, update inventory stock AND log history
        if (newStatus == PurchaseOrder.OrderStatus.RECEIVED) {
            InventoryItem item = order.getInventoryItem();
            double previousQty = item.getQuantityInStock();
            double previousPrice = item.getUnitPrice().doubleValue();
            
            double orderQty = order.getQuantity();
            double orderPrice = order.getUnitPrice().doubleValue();
            
            double newQty = previousQty + orderQty;
            
            // Calculate weighted average cost
            double newUnitPrice = ((previousQty * previousPrice) + (orderQty * orderPrice)) / newQty;
            
            // Format for logging
            String oldPriceStr = String.format("%.2f", previousPrice);
            String newPriceStr = String.format("%.2f", newUnitPrice);
            String purchasePriceStr = String.format("%.2f", orderPrice);
            
            item.setQuantityInStock(newQty);
            item.setUnitPrice(java.math.BigDecimal.valueOf(newUnitPrice));

            if (newExpiryDate != null && !newExpiryDate.trim().isEmpty()) {
                item.setExpiryDate(java.time.LocalDate.parse(newExpiryDate));
            }

            inventoryItemRepository.save(item);
            
            // Get InventoryItemService dynamically to prevent circular dependencies
            InventoryItemService inventoryItemService = applicationContext.getBean(InventoryItemService.class);
            inventoryItemService.checkExpiryAlerts(item);
            inventoryItemService.checkStockAlerts(item, previousQty, newQty);
            
            stockHistoryService.logChange(item, StockHistory.ChangeType.PURCHASE_ORDER, previousQty, newQty,
                    "Restocked via PO " + order.getOrderNumber() + ". Old price: ₹" + oldPriceStr + ", Bought at: ₹" + purchasePriceStr + ", New avg price: ₹" + newPriceStr);
            notificationService.createNotification("Purchase Order " + order.getOrderNumber() + " received.", "PO_RECEIVED");
        }

        return purchaseOrderRepository.save(order);
    }

    // Delete order
    public void deleteOrder(Long id) {
        PurchaseOrder order = getOrderById(id);
        purchaseOrderRepository.delete(order);
    }
}
