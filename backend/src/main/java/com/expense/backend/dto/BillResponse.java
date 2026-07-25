package com.expense.backend.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
public class BillResponse {
    private Long id;
    private String name;
    private BigDecimal amount;
    private LocalDate dueDate;
    private boolean isPaid;
    private String frequency;
    private String icon;
}
