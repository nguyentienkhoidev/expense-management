package com.expense.backend.service;

import com.expense.backend.dto.CategoryResponse;
import com.expense.backend.entity.Category;
import com.expense.backend.repository.CategoryRepository;
import com.expense.backend.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import com.expense.backend.exception.AppException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {
    private final CategoryRepository categoryRepository;
    private final TransactionRepository transactionRepository;

    public List<CategoryResponse> getUserCategories(Long userId) {
        return categoryRepository.findByUserIdOrIsDefaultTrue(userId).stream()
                .collect(Collectors.toMap(
                        c -> c.getName().toLowerCase(),
                        c -> c,
                        (existing, replacement) -> existing.isDefault() ? replacement : existing,
                        java.util.LinkedHashMap::new
                ))
                .values().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private CategoryResponse mapToResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .type(category.getType())
                .icon(category.getIcon())
                .color(category.getColor())
                .isDefault(category.isDefault())
                .build();
    }

    public CategoryResponse createCategory(Long userId, com.expense.backend.dto.CategoryRequest request) {
        Category category = Category.builder()
                .name(request.getName())
                .type(request.getType())
                .color(request.getColor() != null ? request.getColor() : "#10B981") // Default emerald
                .icon(request.getName().substring(0, 1).toUpperCase()) // First letter as icon
                .isDefault(false)
                .userId(userId)
                .build();
                
        return mapToResponse(categoryRepository.save(category));
    }

    public void deleteCategory(Long userId, Long categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new AppException("error.category.notFound"));
                
        if (category.isDefault()) {
            throw new AppException("error.category.cannotDeleteDefault");
        }
        
        if (category.getUserId() == null || !category.getUserId().equals(userId)) {
            throw new AppException("error.unauthorized", HttpStatus.FORBIDDEN);
        }
        
        if (transactionRepository.existsByCategoryId(categoryId)) {
            throw new AppException("error.category.deleteHasTransactions");
        }
        
        categoryRepository.delete(category);
    }
}
