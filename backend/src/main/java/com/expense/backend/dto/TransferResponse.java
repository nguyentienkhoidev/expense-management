package com.expense.backend.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
public class TransferResponse {
    private Long id;
    private BigDecimal amount;
    private LocalDate transferDate;
    private String note;
    private WalletResponse fromWallet;
    private WalletResponse toWallet;
}
