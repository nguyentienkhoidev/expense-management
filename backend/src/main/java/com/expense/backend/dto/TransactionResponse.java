package com.expense.backend.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
public class TransactionResponse {
    private Long id;
    private BigDecimal amount;
    private String note;
    private LocalDate transactionDate;
    private WalletResponse wallet;
    private CategoryResponse category;
}
