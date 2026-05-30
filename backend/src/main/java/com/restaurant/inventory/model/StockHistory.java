package com.restaurant.inventory.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "stock_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class StockHistory {

    public enum ChangeType {
        ADDED,          // Stock manually increased
        REDUCED,        // Stock manually reduced (kitchen usage)
        PURCHASE_ORDER, // Stock added via purchase order received
        ITEM_CREATED,   // New item added to inventory
        ITEM_UPDATED    // Item details updated
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "inventory_item_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private InventoryItem inventoryItem;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ChangeType changeType;

    @Column(name = "previous_quantity")
    private Double previousQuantity;

    @Column(name = "new_quantity")
    private Double newQuantity;

    @Column(name = "change_amount")
    private Double changeAmount;

    @Column
    private String notes;

    @Column(name = "changed_at", updatable = false)
    private LocalDateTime changedAt;

    @PrePersist
    protected void onCreate() {
        changedAt = LocalDateTime.now();
    }
}
