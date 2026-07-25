package com.expense.backend.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PayBillRequest {
    @NotNull
    private Long walletId;
    
    @NotNull
    private Long categoryId;
}
