package com.expense.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class BudgetRequest {
    @NotBlank
    private String name;
    
    @NotNull
    private BigDecimal amount;
    
    private String period; // MONTHLY, YEARLY
    private Long categoryId;
    
    private String icon;
}
