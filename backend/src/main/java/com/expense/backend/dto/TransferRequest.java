package com.expense.backend.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class TransferRequest {
    @NotNull
    @Positive
    private BigDecimal amount;
    
    @NotNull
    private Long fromWalletId;
    
    @NotNull
    private Long toWalletId;
    
    private String note;
    
    @NotNull
    private LocalDate transferDate;
}
