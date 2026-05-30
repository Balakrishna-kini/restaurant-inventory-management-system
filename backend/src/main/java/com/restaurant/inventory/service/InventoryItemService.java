package com.restaurant.inventory.service;

import com.restaurant.inventory.exception.ResourceNotFoundException;
import com.restaurant.inventory.model.Category;
import com.restaurant.inventory.model.InventoryItem;
import com.restaurant.inventory.model.StockHistory;
import com.restaurant.inventory.model.Supplier;
import com.restaurant.inventory.repository.CategoryRepository;
import com.restaurant.inventory.repository.InventoryItemRepository;
import com.restaurant.inventory.repository.NotificationRepository;
import com.restaurant.inventory.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InventoryItemService {

    private final InventoryItemRepository inventoryItemRepository;
    private final CategoryRepository categoryRepository;
    private final SupplierRepository supplierRepository;
    private final StockHistoryService stockHistoryService;
    private final NotificationService notificationService;
    private final NotificationRepository notificationRepository;

    // Get all items
    public List<InventoryItem> getAllItems() {
        return inventoryItemRepository.findAll();
    }

    // Get item by ID
    public InventoryItem getItemById(Long id) {
        return inventoryItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("InventoryItem", "id", id));
    }

    // Search items by name
    public List<InventoryItem> searchItemsByName(String name) {
        return inventoryItemRepository.findByNameContainingIgnoreCase(name);
    }

    // Get items by category
    public List<InventoryItem> getItemsByCategory(Long categoryId) {
        return inventoryItemRepository.findByCategoryId(categoryId);
    }

    // Get items by supplier
    public List<InventoryItem> getItemsBySupplier(Long supplierId) {
        return inventoryItemRepository.findBySupplierId(supplierId);
    }

    // Get low stock items (stock <= reorder level)
    public List<InventoryItem> getLowStockItems() {
        return inventoryItemRepository.findLowStockItems();
    }

    // Get out of stock items (stock == 0)
    public List<InventoryItem> getOutOfStockItems() {
        return inventoryItemRepository.findByQuantityInStockLessThanEqual(0.0);
    }

    // Get expiring soon items
    public List<InventoryItem> getExpiringSoonItems() {
        return inventoryItemRepository.findExpiringSoonItems(java.time.LocalDate.now(), java.time.LocalDate.now().plusDays(7));
    }

    // Get expired items
    public List<InventoryItem> getExpiredItems() {
        return inventoryItemRepository.findExpiredItems(java.time.LocalDate.now());
    }

    // Create new inventory item
    public InventoryItem createItem(InventoryItem item, Long categoryId, Long supplierId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", categoryId));
        item.setCategory(category);

        if (supplierId != null) {
            Supplier supplier = supplierRepository.findById(supplierId)
                    .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", supplierId));
            item.setSupplier(supplier);
        }

        InventoryItem saved = inventoryItemRepository.save(item);
        stockHistoryService.logChange(saved, StockHistory.ChangeType.ITEM_CREATED, 0.0, saved.getQuantityInStock(), "Item created with initial stock");
        notificationService.createNotification("New inventory item \"" + saved.getName() + "\" added.", "ITEM_ADDED");
        checkExpiryAlerts(saved);
        checkStockAlerts(saved, Double.MAX_VALUE, saved.getQuantityInStock());
        return saved;
    }

    // Update inventory item
    public InventoryItem updateItem(Long id, InventoryItem itemDetails, Long categoryId, Long supplierId) {
        InventoryItem item = getItemById(id);

        double previousQty = item.getQuantityInStock();

        item.setName(itemDetails.getName());
        item.setDescription(itemDetails.getDescription());
        item.setUnit(itemDetails.getUnit());
        item.setQuantityInStock(itemDetails.getQuantityInStock());
        item.setReorderLevel(itemDetails.getReorderLevel());
        item.setUnitPrice(itemDetails.getUnitPrice());
        
        boolean expiryChanged = false;
        if ((item.getExpiryDate() == null && itemDetails.getExpiryDate() != null) || 
            (item.getExpiryDate() != null && !item.getExpiryDate().equals(itemDetails.getExpiryDate()))) {
            expiryChanged = true;
        }
        item.setExpiryDate(itemDetails.getExpiryDate());

        if (categoryId != null) {
            Category category = categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new ResourceNotFoundException("Category", "id", categoryId));
            item.setCategory(category);
        }

        if (supplierId != null) {
            Supplier supplier = supplierRepository.findById(supplierId)
                    .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", supplierId));
            item.setSupplier(supplier);
        }

        InventoryItem saved = inventoryItemRepository.save(item);
        stockHistoryService.logChange(saved, StockHistory.ChangeType.ITEM_UPDATED, previousQty, saved.getQuantityInStock(), "Item details updated");
        if (expiryChanged) {
            stockHistoryService.logChange(saved, StockHistory.ChangeType.ITEM_UPDATED, previousQty, saved.getQuantityInStock(), saved.getName() + " expiry date updated.");
        }
        notificationService.createNotification(saved.getName() + " inventory details updated.", "ITEM_UPDATED");
        checkExpiryAlerts(saved);
        checkStockAlerts(saved, previousQty, saved.getQuantityInStock());
        return saved;
    }

    public void checkExpiryAlerts(InventoryItem item) {
        if (item.getExpiryDate() != null) {
             long days = ChronoUnit.DAYS.between(LocalDate.now(), item.getExpiryDate());
             String msg = null;
             String type = null;
             
             if (days < 0) {
                 long pastDays = Math.abs(days);
                 msg = "❌ " + item.getName() + " expired " + pastDays + " day" + (pastDays > 1 ? "s" : "") + " ago.";
                 type = "ITEM_EXPIRED";
             } else if (days == 0) {
                 msg = "⚠️ " + item.getName() + " expires today.";
                 type = "ITEM_EXPIRING_SOON";
             } else if (days <= 7) {
                 msg = "🔥 " + item.getName() + " expires in " + days + " days.";
                 type = "ITEM_EXPIRING_SOON";
             }

             if (msg != null && !notificationRepository.existsByMessageAndCreatedAtAfter(msg, LocalDateTime.now().withHour(0).withMinute(0).withSecond(0))) {
                 notificationService.createNotification(msg, type);
                 if (type.equals("ITEM_EXPIRED")) {
                     stockHistoryService.logChange(item, StockHistory.ChangeType.ITEM_UPDATED, item.getQuantityInStock(), item.getQuantityInStock(), item.getName() + " expired.");
                 } else if (days == 7 || days == 3 || days == 1) {
                     stockHistoryService.logChange(item, StockHistory.ChangeType.ITEM_UPDATED, item.getQuantityInStock(), item.getQuantityInStock(), item.getName() + " entered expiry warning period.");
                 }
             }
        }
    }

    @Scheduled(fixedDelay = 3600000) // Runs every hour to check for new expirations without waiting for midnight during dev
    public void dailyExpiryCheck() {
        List<InventoryItem> items = inventoryItemRepository.findAll();
        for (InventoryItem item : items) {
            checkExpiryAlerts(item);
        }
    }

    public void checkStockAlerts(InventoryItem item, double previous, double current) {
        if (current <= 0 && previous > 0) {
            notificationService.createNotification(item.getName() + " is out of stock.", "OUT_OF_STOCK");
        } else if (current > 0 && current <= item.getReorderLevel() && previous > item.getReorderLevel()) {
            notificationService.createNotification(item.getName() + " is running low on stock.", "LOW_STOCK");
        }
    }

    // Update stock quantity only
    public InventoryItem updateStock(Long id, Double newQuantity, String notes) {
        InventoryItem item = getItemById(id);
        double previous = item.getQuantityInStock();
        item.setQuantityInStock(newQuantity);
        InventoryItem saved = inventoryItemRepository.save(item);
        String logNotes = (notes != null && !notes.trim().isEmpty()) ? notes.trim() : "Stock manually updated";
        
        if (newQuantity > previous) {
            stockHistoryService.logChange(saved, StockHistory.ChangeType.ADDED, previous, newQuantity, logNotes);
            notificationService.createNotification(saved.getName() + " stock increased by " + (newQuantity - previous) + " " + saved.getUnit() + ".", "STOCK_INCREASED");
        } else if (newQuantity < previous) {
            stockHistoryService.logChange(saved, StockHistory.ChangeType.REDUCED, previous, newQuantity, logNotes);
            notificationService.createNotification(saved.getName() + " stock reduced by " + (previous - newQuantity) + " " + saved.getUnit() + ".", "STOCK_REDUCED");
        }

        checkStockAlerts(saved, previous, newQuantity);
        return saved;
    }

    // Reduce stock (kitchen usage)
    public InventoryItem reduceStock(Long id, Double quantityUsed, String notes) {
        InventoryItem item = getItemById(id);
        double previous = item.getQuantityInStock();
        double newQty = previous - quantityUsed;
        if (newQty < 0) {
            throw new RuntimeException("Insufficient stock. Available: " + previous);
        }
        item.setQuantityInStock(newQty);
        InventoryItem saved = inventoryItemRepository.save(item);
        String logNotes = (notes != null && !notes.trim().isEmpty()) ? notes.trim() : "Stock reduced by " + quantityUsed + " " + item.getUnit();
        stockHistoryService.logChange(saved, StockHistory.ChangeType.REDUCED, previous, newQty, logNotes);
        notificationService.createNotification(saved.getName() + " stock reduced by " + quantityUsed + " " + saved.getUnit() + ".", "STOCK_REDUCED");
        
        checkStockAlerts(saved, previous, newQty);
        return saved;
    }

    // Delete item
    public void deleteItem(Long id) {
        InventoryItem item = getItemById(id);
        inventoryItemRepository.delete(item);
        notificationService.createNotification("Inventory item \"" + item.getName() + "\" deleted.", "ITEM_DELETED");
    }
}
