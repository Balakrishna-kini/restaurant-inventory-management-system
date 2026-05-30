package com.restaurant.inventory.mapper;

import com.restaurant.inventory.dto.*;
import com.restaurant.inventory.model.*;
import org.springframework.stereotype.Component;

@Component
public class DTOMapper {

    public CategoryDTO toCategoryDTO(Category category) {
        if (category == null) return null;
        CategoryDTO dto = new CategoryDTO();
        dto.setId(category.getId());
        dto.setName(category.getName());
        dto.setDescription(category.getDescription());
        dto.setCreatedAt(category.getCreatedAt());
        dto.setUpdatedAt(category.getUpdatedAt());
        dto.setActive(category.isActive());
        return dto;
    }

    public SupplierDTO toSupplierDTO(Supplier supplier) {
        if (supplier == null) return null;
        SupplierDTO dto = new SupplierDTO();
        dto.setId(supplier.getId());
        dto.setName(supplier.getName());
        dto.setEmail(supplier.getEmail());
        dto.setPhone(supplier.getPhone());
        dto.setAddress(supplier.getAddress());
        dto.setContactPerson(supplier.getContactPerson());
        dto.setCreatedAt(supplier.getCreatedAt());
        dto.setUpdatedAt(supplier.getUpdatedAt());
        dto.setActive(supplier.isActive());
        return dto;
    }

    public InventoryItemDTO toInventoryItemDTO(InventoryItem item) {
        if (item == null) return null;
        InventoryItemDTO dto = new InventoryItemDTO();
        dto.setId(item.getId());
        dto.setName(item.getName());
        dto.setDescription(item.getDescription());
        dto.setUnit(item.getUnit());
        dto.setQuantityInStock(item.getQuantityInStock());
        dto.setReorderLevel(item.getReorderLevel());
        dto.setUnitPrice(item.getUnitPrice());
        dto.setExpiryDate(item.getExpiryDate());
        dto.setCategory(toCategoryDTO(item.getCategory()));
        dto.setSupplier(toSupplierDTO(item.getSupplier()));
        dto.setCreatedAt(item.getCreatedAt());
        dto.setUpdatedAt(item.getUpdatedAt());
        return dto;
    }

    public PurchaseOrderDTO toPurchaseOrderDTO(PurchaseOrder po) {
        if (po == null) return null;
        PurchaseOrderDTO dto = new PurchaseOrderDTO();
        dto.setId(po.getId());
        dto.setOrderNumber(po.getOrderNumber());
        dto.setInventoryItem(toInventoryItemDTO(po.getInventoryItem()));
        dto.setSupplier(toSupplierDTO(po.getSupplier()));
        dto.setQuantity(po.getQuantity());
        dto.setUnitPrice(po.getUnitPrice());
        dto.setTotalPrice(po.getTotalPrice());
        dto.setStatus(po.getStatus() != null ? po.getStatus().name() : null);
        dto.setNotes(po.getNotes());
        dto.setOrderDate(po.getOrderDate());
        dto.setUpdatedAt(po.getUpdatedAt());
        return dto;
    }

    public StockHistoryDTO toStockHistoryDTO(StockHistory history) {
        if (history == null) return null;
        StockHistoryDTO dto = new StockHistoryDTO();
        dto.setId(history.getId());
        dto.setInventoryItem(toInventoryItemDTO(history.getInventoryItem()));
        dto.setChangeType(history.getChangeType() != null ? history.getChangeType().name() : null);
        dto.setPreviousQuantity(history.getPreviousQuantity());
        dto.setNewQuantity(history.getNewQuantity());
        dto.setChangeAmount(history.getChangeAmount());
        dto.setNotes(history.getNotes());
        dto.setChangedAt(history.getChangedAt());
        return dto;
    }
}
