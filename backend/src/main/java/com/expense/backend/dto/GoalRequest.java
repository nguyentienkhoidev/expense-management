package com.expense.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class GoalRequest {
    @NotBlank
    private String name;
    
    @NotNull
    private BigDecimal targetAmount;
    
    @NotNull
    private BigDecimal currentAmount;
    
    private LocalDate targetDate;
    private String color;
    private String icon;
}
