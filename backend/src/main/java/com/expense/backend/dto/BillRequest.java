package com.expense.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class BillRequest {
    @NotBlank
    private String name;
    
    @NotNull
    private BigDecimal amount;
    
    private LocalDate dueDate;
    private String frequency; // MONTHLY, YEARLY, ONE_TIME
    private String icon;
}
