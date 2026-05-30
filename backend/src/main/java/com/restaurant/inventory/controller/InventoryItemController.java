package com.restaurant.inventory.controller;

import com.restaurant.inventory.model.InventoryItem;
import com.restaurant.inventory.service.InventoryItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import com.restaurant.inventory.dto.InventoryItemDTO;
import com.restaurant.inventory.mapper.DTOMapper;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InventoryItemController {

    private final InventoryItemService inventoryItemService;
    private final DTOMapper dtoMapper;

    // GET /api/inventory - Get all items
    @GetMapping
    public ResponseEntity<List<InventoryItemDTO>> getAllItems() {
        List<InventoryItemDTO> dtos = inventoryItemService.getAllItems().stream()
                .map(dtoMapper::toInventoryItemDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    // GET /api/inventory/{id} - Get item by ID
    @GetMapping("/{id}")
    public ResponseEntity<InventoryItemDTO> getItemById(@PathVariable Long id) {
        return ResponseEntity.ok(dtoMapper.toInventoryItemDTO(inventoryItemService.getItemById(id)));
    }

    // GET /api/inventory/search?name=abc - Search items by name
    @GetMapping("/search")
    public ResponseEntity<List<InventoryItemDTO>> searchItems(@RequestParam String name) {
        return ResponseEntity.ok(inventoryItemService.searchItemsByName(name).stream()
                .map(dtoMapper::toInventoryItemDTO).collect(Collectors.toList()));
    }

    // GET /api/inventory/category/{categoryId} - Get items by category
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<InventoryItemDTO>> getItemsByCategory(@PathVariable Long categoryId) {
        return ResponseEntity.ok(inventoryItemService.getItemsByCategory(categoryId).stream()
                .map(dtoMapper::toInventoryItemDTO).collect(Collectors.toList()));
    }

    // GET /api/inventory/supplier/{supplierId} - Get items by supplier
    @GetMapping("/supplier/{supplierId}")
    public ResponseEntity<List<InventoryItemDTO>> getItemsBySupplier(@PathVariable Long supplierId) {
        return ResponseEntity.ok(inventoryItemService.getItemsBySupplier(supplierId).stream()
                .map(dtoMapper::toInventoryItemDTO).collect(Collectors.toList()));
    }

    // GET /api/inventory/low-stock - Get all low stock items
    @GetMapping("/low-stock")
    public ResponseEntity<List<InventoryItemDTO>> getLowStockItems() {
        return ResponseEntity.ok(inventoryItemService.getLowStockItems().stream()
                .map(dtoMapper::toInventoryItemDTO).collect(Collectors.toList()));
    }

    // GET /api/inventory/out-of-stock - Get out of stock items
    @GetMapping("/out-of-stock")
    public ResponseEntity<List<InventoryItemDTO>> getOutOfStockItems() {
        return ResponseEntity.ok(inventoryItemService.getOutOfStockItems().stream()
                .map(dtoMapper::toInventoryItemDTO).collect(Collectors.toList()));
    }

    // GET /api/inventory/expiring-soon - Get items expiring within 7 days
    @GetMapping("/expiring-soon")
    public ResponseEntity<List<InventoryItemDTO>> getExpiringSoonItems() {
        return ResponseEntity.ok(inventoryItemService.getExpiringSoonItems().stream()
                .map(dtoMapper::toInventoryItemDTO).collect(Collectors.toList()));
    }

    // GET /api/inventory/expired - Get expired items
    @GetMapping("/expired")
    public ResponseEntity<List<InventoryItemDTO>> getExpiredItems() {
        return ResponseEntity.ok(inventoryItemService.getExpiredItems().stream()
                .map(dtoMapper::toInventoryItemDTO).collect(Collectors.toList()));
    }

    // POST /api/inventory?categoryId=1&supplierId=2 - Create new item
    @PostMapping
    public ResponseEntity<InventoryItemDTO> createItem(
            @RequestBody InventoryItem item,
            @RequestParam Long categoryId,
            @RequestParam(required = false) Long supplierId) {
        return new ResponseEntity<>(dtoMapper.toInventoryItemDTO(inventoryItemService.createItem(item, categoryId, supplierId)), HttpStatus.CREATED);
    }

    // PUT /api/inventory/{id}?categoryId=1&supplierId=2 - Update item
    @PutMapping("/{id}")
    public ResponseEntity<InventoryItemDTO> updateItem(
            @PathVariable Long id,
            @RequestBody InventoryItem item,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long supplierId) {
        return ResponseEntity.ok(dtoMapper.toInventoryItemDTO(inventoryItemService.updateItem(id, item, categoryId, supplierId)));
    }

    // PATCH /api/inventory/{id}/stock - Update stock quantity
    @PatchMapping("/{id}/stock")
    public ResponseEntity<InventoryItemDTO> updateStock(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        Double newQuantity = Double.valueOf(body.get("quantity").toString());
        String notes = body.containsKey("notes") ? (String) body.get("notes") : null;
        return ResponseEntity.ok(dtoMapper.toInventoryItemDTO(inventoryItemService.updateStock(id, newQuantity, notes)));
    }

    // PATCH /api/inventory/{id}/reduce-stock - Reduce stock (kitchen usage)
    @PatchMapping("/{id}/reduce-stock")
    public ResponseEntity<InventoryItemDTO> reduceStock(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        Double quantityUsed = Double.valueOf(body.get("quantity").toString());
        String notes = body.containsKey("notes") ? (String) body.get("notes") : null;
        return ResponseEntity.ok(dtoMapper.toInventoryItemDTO(inventoryItemService.reduceStock(id, quantityUsed, notes)));
    }

    // DELETE /api/inventory/{id} - Delete item
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteItem(@PathVariable Long id) {
        inventoryItemService.deleteItem(id);
        return ResponseEntity.ok("Inventory item deleted successfully");
    }
}
