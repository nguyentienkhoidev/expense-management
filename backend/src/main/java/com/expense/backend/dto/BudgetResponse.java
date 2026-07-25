package com.expense.backend.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class BudgetResponse {
    private Long id;
    private String name;
    private BigDecimal amount;
    private BigDecimal spent;
    private String period;
    private CategoryResponse category;
    private String icon;
}
