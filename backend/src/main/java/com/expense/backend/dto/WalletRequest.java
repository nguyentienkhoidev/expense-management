package com.expense.backend.dto;

import lombok.Data;
import java.math.BigDecimal;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Data
public class WalletRequest {
    @NotBlank
    private String name;
    
    @NotBlank
    private String type;
    
    @NotNull
    private BigDecimal balance;
    
    private String icon;
}
