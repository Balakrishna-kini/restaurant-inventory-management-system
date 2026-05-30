package com.restaurant.inventory.service;

import com.restaurant.inventory.exception.ResourceNotFoundException;
import com.restaurant.inventory.model.Category;
import com.restaurant.inventory.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final NotificationService notificationService;

    // Get all categories
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    // Get category by ID
    public Category getCategoryById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
    }

    public Category createCategory(Category category) {
        Category saved = categoryRepository.save(category);
        notificationService.createNotification("New category \"" + saved.getName() + "\" added.", "CATEGORY_ADDED");
        return saved;
    }

    // Update existing category
    public Category updateCategory(Long id, Category categoryDetails) {
        Category category = getCategoryById(id);
        category.setName(categoryDetails.getName());
        category.setDescription(categoryDetails.getDescription());
        Category saved = categoryRepository.save(category);
        notificationService.createNotification("Category \"" + saved.getName() + "\" updated.", "CATEGORY_UPDATED");
        return saved;
    }

    // Delete category
    public void deleteCategory(Long id) {
        Category category = getCategoryById(id);
        categoryRepository.delete(category);
        notificationService.createNotification("Category \"" + category.getName() + "\" deleted.", "CATEGORY_DELETED");
    }
}
