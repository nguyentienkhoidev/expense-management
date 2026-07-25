package com.expense.backend.dto;

import com.expense.backend.entity.Category;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CategoryResponse {
    private Long id;
    private String name;
    private Category.Type type;
    private String icon;
    private String color;
    private boolean isDefault;
}
