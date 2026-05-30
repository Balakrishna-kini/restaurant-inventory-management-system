package com.restaurant.inventory.controller;

import com.restaurant.inventory.model.PurchaseOrder;
import com.restaurant.inventory.service.PurchaseOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import com.restaurant.inventory.dto.PurchaseOrderDTO;
import com.restaurant.inventory.mapper.DTOMapper;

@RestController
@RequestMapping("/api/purchase-orders")
@RequiredArgsConstructor
public class PurchaseOrderController {

    private final PurchaseOrderService purchaseOrderService;
    private final DTOMapper dtoMapper;

    // GET /api/purchase-orders - Get all orders
    @GetMapping
    public ResponseEntity<List<PurchaseOrderDTO>> getAllOrders() {
        return ResponseEntity.ok(purchaseOrderService.getAllOrders().stream()
                .map(dtoMapper::toPurchaseOrderDTO).collect(Collectors.toList()));
    }

    // GET /api/purchase-orders/{id} - Get order by ID
    @GetMapping("/{id}")
    public ResponseEntity<PurchaseOrderDTO> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(dtoMapper.toPurchaseOrderDTO(purchaseOrderService.getOrderById(id)));
    }

    // GET /api/purchase-orders/status/{status} - Get orders by status
    @GetMapping("/status/{status}")
    public ResponseEntity<List<PurchaseOrderDTO>> getOrdersByStatus(@PathVariable String status) {
        PurchaseOrder.OrderStatus orderStatus = PurchaseOrder.OrderStatus.valueOf(status.toUpperCase());
        return ResponseEntity.ok(purchaseOrderService.getOrdersByStatus(orderStatus).stream()
                .map(dtoMapper::toPurchaseOrderDTO).collect(Collectors.toList()));
    }

    // GET /api/purchase-orders/supplier/{supplierId} - Get orders by supplier
    @GetMapping("/supplier/{supplierId}")
    public ResponseEntity<List<PurchaseOrderDTO>> getOrdersBySupplier(@PathVariable Long supplierId) {
        return ResponseEntity.ok(purchaseOrderService.getOrdersBySupplier(supplierId).stream()
                .map(dtoMapper::toPurchaseOrderDTO).collect(Collectors.toList()));
    }

    // POST /api/purchase-orders?itemId=1&supplierId=2 - Create new order
    @PostMapping
    public ResponseEntity<PurchaseOrderDTO> createOrder(
            @RequestBody PurchaseOrder order,
            @RequestParam Long itemId,
            @RequestParam Long supplierId) {
        return new ResponseEntity<>(dtoMapper.toPurchaseOrderDTO(purchaseOrderService.createOrder(order, itemId, supplierId)), HttpStatus.CREATED);
    }

    // PATCH /api/purchase-orders/{id}/status - Update order status
    @PatchMapping("/{id}/status")
    public ResponseEntity<PurchaseOrderDTO> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        PurchaseOrder.OrderStatus status = PurchaseOrder.OrderStatus.valueOf(body.get("status").toUpperCase());
        String newExpiryDate = body.get("newExpiryDate");
        return ResponseEntity.ok(dtoMapper.toPurchaseOrderDTO(purchaseOrderService.updateOrderStatus(id, status, newExpiryDate)));
    }

    // DELETE /api/purchase-orders/{id} - Delete order
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteOrder(@PathVariable Long id) {
        purchaseOrderService.deleteOrder(id);
        return ResponseEntity.ok("Purchase order deleted successfully");
    }
}
