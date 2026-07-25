package com.expense.backend.controller;

import com.expense.backend.dto.BudgetRequest;
import com.expense.backend.dto.BudgetResponse;
import com.expense.backend.security.UserDetailsImpl;
import com.expense.backend.service.BudgetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;

    private Long getUserId(Authentication auth) {
        return ((UserDetailsImpl) auth.getPrincipal()).getId();
    }

    @GetMapping
    public ResponseEntity<List<BudgetResponse>> getBudgets(Authentication auth) {
        return ResponseEntity.ok(budgetService.getUserBudgets(getUserId(auth)));
    }

    @PostMapping
    public ResponseEntity<BudgetResponse> createBudget(@Valid @RequestBody BudgetRequest request, Authentication auth) {
        return ResponseEntity.ok(budgetService.createBudget(getUserId(auth), request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBudget(@PathVariable Long id, Authentication auth) {
        budgetService.deleteBudget(getUserId(auth), id);
        return ResponseEntity.ok().build();
    }
}
