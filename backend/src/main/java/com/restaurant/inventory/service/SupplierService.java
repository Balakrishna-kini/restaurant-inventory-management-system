package com.restaurant.inventory.service;

import com.restaurant.inventory.exception.ResourceNotFoundException;
import com.restaurant.inventory.model.Supplier;
import com.restaurant.inventory.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SupplierService {

    private final SupplierRepository supplierRepository;
    private final NotificationService notificationService;

    // Get all suppliers
    public List<Supplier> getAllSuppliers() {
        return supplierRepository.findAll();
    }

    // Get supplier by ID
    public Supplier getSupplierById(Long id) {
        return supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", id));
    }

    // Search suppliers by name
    public List<Supplier> searchSuppliersByName(String name) {
        return supplierRepository.findByNameContainingIgnoreCase(name);
    }

    // Create new supplier
    public Supplier createSupplier(Supplier supplier) {
        Supplier saved = supplierRepository.save(supplier);
        notificationService.createNotification("New supplier \"" + saved.getName() + "\" added.", "SUPPLIER_ADDED");
        return saved;
    }

    // Update existing supplier
    public Supplier updateSupplier(Long id, Supplier supplierDetails) {
        Supplier supplier = getSupplierById(id);
        supplier.setName(supplierDetails.getName());
        supplier.setEmail(supplierDetails.getEmail());
        supplier.setPhone(supplierDetails.getPhone());
        supplier.setAddress(supplierDetails.getAddress());
        supplier.setContactPerson(supplierDetails.getContactPerson());
        Supplier saved = supplierRepository.save(supplier);
        notificationService.createNotification("Supplier \"" + saved.getName() + "\" updated.", "SUPPLIER_UPDATED");
        return saved;
    }

    // Delete supplier
    public void deleteSupplier(Long id) {
        Supplier supplier = getSupplierById(id);
        supplierRepository.delete(supplier);
        notificationService.createNotification("Supplier \"" + supplier.getName() + "\" deleted.", "SUPPLIER_DELETED");
    }
}
