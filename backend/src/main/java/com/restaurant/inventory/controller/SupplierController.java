package com.restaurant.inventory.controller;

import com.restaurant.inventory.model.Supplier;
import com.restaurant.inventory.service.SupplierService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;
import com.restaurant.inventory.dto.SupplierDTO;
import com.restaurant.inventory.mapper.DTOMapper;

@RestController
@RequestMapping("/api/suppliers")
@RequiredArgsConstructor
public class SupplierController {

    private final SupplierService supplierService;
    private final DTOMapper dtoMapper;

    // GET /api/suppliers - Get all suppliers
    @GetMapping
    public ResponseEntity<List<SupplierDTO>> getAllSuppliers() {
        return ResponseEntity.ok(supplierService.getAllSuppliers().stream()
                .map(dtoMapper::toSupplierDTO).collect(Collectors.toList()));
    }

    // GET /api/suppliers/{id} - Get supplier by ID
    @GetMapping("/{id}")
    public ResponseEntity<SupplierDTO> getSupplierById(@PathVariable Long id) {
        return ResponseEntity.ok(dtoMapper.toSupplierDTO(supplierService.getSupplierById(id)));
    }

    // GET /api/suppliers/search?name=abc - Search suppliers by name
    @GetMapping("/search")
    public ResponseEntity<List<SupplierDTO>> searchSuppliers(@RequestParam String name) {
        return ResponseEntity.ok(supplierService.searchSuppliersByName(name).stream()
                .map(dtoMapper::toSupplierDTO).collect(Collectors.toList()));
    }

    // POST /api/suppliers - Create new supplier
    @PostMapping
    public ResponseEntity<SupplierDTO> createSupplier(@RequestBody Supplier supplier) {
        return new ResponseEntity<>(dtoMapper.toSupplierDTO(supplierService.createSupplier(supplier)), HttpStatus.CREATED);
    }

    // PUT /api/suppliers/{id} - Update supplier
    @PutMapping("/{id}")
    public ResponseEntity<SupplierDTO> updateSupplier(@PathVariable Long id, @RequestBody Supplier supplier) {
        return ResponseEntity.ok(dtoMapper.toSupplierDTO(supplierService.updateSupplier(id, supplier)));
    }

    // DELETE /api/suppliers/{id} - Delete supplier
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteSupplier(@PathVariable Long id) {
        supplierService.deleteSupplier(id);
        return ResponseEntity.ok("Supplier deleted successfully");
    }
}
