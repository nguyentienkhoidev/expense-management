package com.expense.backend.service;

import com.expense.backend.entity.Category;
import com.expense.backend.entity.Transaction;
import com.expense.backend.repository.CategoryRepository;
import com.expense.backend.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {
    
    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;

    public List<Map<String, Object>> getCashflow(Long userId, int months) {
        List<Transaction> transactions = transactionRepository.findByUserIdOrderByTransactionDateDesc(userId);
        
        Map<Long, Category> categoryMap = categoryRepository.findByUserIdOrIsDefaultTrue(userId).stream()
                .collect(Collectors.toMap(Category::getId, c -> c));
        
        // Group by YYYY-MM for accurate cross-year grouping
        Map<YearMonth, List<Transaction>> grouped = new HashMap<>();
        for (Transaction t : transactions) {
            YearMonth ym = YearMonth.from(t.getTransactionDate());
            grouped.computeIfAbsent(ym, k -> new ArrayList<>()).add(t);
        }
            
        List<Map<String, Object>> result = new ArrayList<>();
        
        // Generate last N months
        YearMonth current = YearMonth.now().minusMonths(months - 1);
        DateTimeFormatter labelFormat = DateTimeFormatter.ofPattern("MMM");
        
        for (int i = 0; i < months; i++) {
            List<Transaction> monthTxs = grouped.getOrDefault(current, Collections.emptyList());
            
            double income = monthTxs.stream()
                .filter(t -> {
                    Category cat = categoryMap.get(t.getCategoryId());
                    return cat != null && cat.getType() == Category.Type.INCOME;
                })
                .mapToDouble(t -> t.getAmount().doubleValue())
                .sum();
                
            double expense = monthTxs.stream()
                .filter(t -> {
                    Category cat = categoryMap.get(t.getCategoryId());
                    return cat != null && cat.getType() == Category.Type.EXPENSE;
                })
                .mapToDouble(t -> t.getAmount().doubleValue())
                .sum();
                
            Map<String, Object> data = new LinkedHashMap<>();
            data.put("name", current.format(labelFormat));
            data.put("income", income);
            data.put("expense", expense);
            
            result.add(data);
            current = current.plusMonths(1);
        }
        
        return result;
    }
}
