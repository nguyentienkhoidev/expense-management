package com.expense.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TwoFactorEnableRequest {
    @NotBlank
    private String code;
}
