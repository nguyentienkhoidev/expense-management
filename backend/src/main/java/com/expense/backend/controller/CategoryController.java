package com.expense.backend.controller;

import com.expense.backend.dto.CategoryResponse;
import com.expense.backend.security.UserDetailsImpl;
import com.expense.backend.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    private Long getUserId(Authentication auth) {
        return ((UserDetailsImpl) auth.getPrincipal()).getId();
    }

    @GetMapping
    public ResponseEntity<List<CategoryResponse>> getCategories(Authentication auth) {
        return ResponseEntity.ok(categoryService.getUserCategories(getUserId(auth)));
    }

    @PostMapping
    public ResponseEntity<CategoryResponse> createCategory(@RequestBody com.expense.backend.dto.CategoryRequest request, Authentication auth) {
        return ResponseEntity.ok(categoryService.createCategory(getUserId(auth), request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable Long id, Authentication auth) {
        try {
            categoryService.deleteCategory(getUserId(auth), id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
