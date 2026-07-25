package com.expense.backend.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class WalletResponse {
    private Long id;
    private String name;
    private String type;
    private BigDecimal balance;
    private Boolean isActive;
    private String icon;
}
