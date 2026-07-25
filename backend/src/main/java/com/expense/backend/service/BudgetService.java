package com.expense.backend.service;

import com.expense.backend.dto.BudgetRequest;
import com.expense.backend.dto.BudgetResponse;
import com.expense.backend.dto.CategoryResponse;
import com.expense.backend.entity.Budget;
import com.expense.backend.entity.Category;
import com.expense.backend.entity.User;
import com.expense.backend.repository.BudgetRepository;
import com.expense.backend.repository.CategoryRepository;
import com.expense.backend.repository.TransactionRepository;
import com.expense.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import com.expense.backend.exception.AppException;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BudgetService {
    
    private final BudgetRepository budgetRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final TransactionRepository transactionRepository;

    public List<BudgetResponse> getUserBudgets(Long userId) {
        return budgetRepository.findByUserId(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public BudgetResponse createBudget(Long userId, BudgetRequest request) {
        Budget budget = Budget.builder()
                .name(request.getName())
                .amount(request.getAmount())
                .period(request.getPeriod())
                .categoryId(request.getCategoryId())
                .icon(request.getIcon())
                .userId(userId)
                .build();

        Budget savedBudget = budgetRepository.save(budget);
        return mapToResponse(savedBudget);
    }

    public void deleteBudget(Long userId, Long budgetId) {
        Budget budget = budgetRepository.findById(budgetId)
                .orElseThrow(() -> new AppException("error.budget.notFound"));
        if (!budget.getUserId().equals(userId)) {
            throw new AppException("error.unauthorized", HttpStatus.FORBIDDEN);
        }
        budgetRepository.delete(budget);
    }

    private BudgetResponse mapToResponse(Budget budget) {
        // Calculate spent amount based on transactions for this category within the budget period
        BigDecimal spent = BigDecimal.ZERO;
        
        CategoryResponse categoryResponse = null;
        if (budget.getCategoryId() != null) {
            Category category = categoryRepository.findById(budget.getCategoryId()).orElse(null);
            if (category != null) {
                categoryResponse = CategoryResponse.builder()
                    .id(category.getId())
                    .name(category.getName())
                    .type(category.getType())
                    .icon(category.getIcon())
                    .color(category.getColor())
                    .build();
            }
                
            // Filter transactions by current period (month or year)
            java.time.LocalDate now = java.time.LocalDate.now();
            java.time.LocalDate periodStart;
            if ("YEARLY".equals(budget.getPeriod())) {
                periodStart = now.withDayOfYear(1);
            } else {
                // Default: MONTHLY
                periodStart = now.withDayOfMonth(1);
            }
            
            spent = transactionRepository.findByUserIdOrderByTransactionDateDesc(budget.getUserId())
                    .stream()
                    .filter(t -> t.getCategoryId().equals(budget.getCategoryId()))
                    .filter(t -> !t.getTransactionDate().isBefore(periodStart) && !t.getTransactionDate().isAfter(now))
                    .map(t -> t.getAmount())
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
        }

        return BudgetResponse.builder()
                .id(budget.getId())
                .name(budget.getName())
                .amount(budget.getAmount())
                .spent(spent)
                .period(budget.getPeriod())
                .category(categoryResponse)
                .icon(budget.getIcon())
                .build();
    }
}
