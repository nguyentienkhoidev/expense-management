package com.expense.backend.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

@Data
public class TransactionRequest {
    @NotNull
    @Positive
    private BigDecimal amount;
    
    private String note;
    
    @NotNull
    private LocalDate transactionDate;
    
    @NotNull
    private Long walletId;
    
    @NotNull
    private Long categoryId;
}
