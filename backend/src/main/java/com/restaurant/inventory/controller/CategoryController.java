package com.restaurant.inventory.controller;

import com.restaurant.inventory.model.Category;
import com.restaurant.inventory.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;
import com.restaurant.inventory.dto.CategoryDTO;
import com.restaurant.inventory.mapper.DTOMapper;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;
    private final DTOMapper dtoMapper;

    // GET /api/categories - Get all categories
    @GetMapping
    public ResponseEntity<List<CategoryDTO>> getAllCategories() {
        return ResponseEntity.ok(categoryService.getAllCategories().stream()
                .map(dtoMapper::toCategoryDTO).collect(Collectors.toList()));
    }

    // GET /api/categories/{id} - Get category by ID
    @GetMapping("/{id}")
    public ResponseEntity<CategoryDTO> getCategoryById(@PathVariable Long id) {
        return ResponseEntity.ok(dtoMapper.toCategoryDTO(categoryService.getCategoryById(id)));
    }

    // POST /api/categories - Create new category
    @PostMapping
    public ResponseEntity<CategoryDTO> createCategory(@RequestBody Category category) {
        return new ResponseEntity<>(dtoMapper.toCategoryDTO(categoryService.createCategory(category)), HttpStatus.CREATED);
    }

    // PUT /api/categories/{id} - Update category
    @PutMapping("/{id}")
    public ResponseEntity<CategoryDTO> updateCategory(@PathVariable Long id, @RequestBody Category category) {
        return ResponseEntity.ok(dtoMapper.toCategoryDTO(categoryService.updateCategory(id, category)));
    }

    // DELETE /api/categories/{id} - Delete category
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok("Category deleted successfully");
    }
}
