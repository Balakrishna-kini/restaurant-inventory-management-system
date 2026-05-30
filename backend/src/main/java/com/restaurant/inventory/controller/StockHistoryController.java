package com.restaurant.inventory.controller;

import com.restaurant.inventory.model.StockHistory;
import com.restaurant.inventory.service.StockHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;
import com.restaurant.inventory.dto.StockHistoryDTO;
import com.restaurant.inventory.mapper.DTOMapper;

@RestController
@RequestMapping("/api/stock-history")
@RequiredArgsConstructor
public class StockHistoryController {

    private final StockHistoryService stockHistoryService;
    private final DTOMapper dtoMapper;

    // GET /api/stock-history - Get all history (newest first)
    @GetMapping
    public ResponseEntity<List<StockHistoryDTO>> getAllHistory() {
        return ResponseEntity.ok(stockHistoryService.getAllHistory().stream()
                .map(dtoMapper::toStockHistoryDTO).collect(Collectors.toList()));
    }

    // GET /api/stock-history/item/{itemId} - Get history for one item
    @GetMapping("/item/{itemId}")
    public ResponseEntity<List<StockHistoryDTO>> getHistoryByItem(@PathVariable Long itemId) {
        return ResponseEntity.ok(stockHistoryService.getHistoryByItem(itemId).stream()
                .map(dtoMapper::toStockHistoryDTO).collect(Collectors.toList()));
    }

    // GET /api/stock-history/type/{type} - Get by change type
    @GetMapping("/type/{type}")
    public ResponseEntity<List<StockHistoryDTO>> getHistoryByType(@PathVariable String type) {
        StockHistory.ChangeType changeType = StockHistory.ChangeType.valueOf(type.toUpperCase());
        return ResponseEntity.ok(stockHistoryService.getHistoryByType(changeType).stream()
                .map(dtoMapper::toStockHistoryDTO).collect(Collectors.toList()));
    }
}
