package com.expense.backend.config;

import com.expense.backend.entity.Category;
import com.expense.backend.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;

@Configuration
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final CategoryRepository categoryRepository;

    @Override
    public void run(String... args) throws Exception {
        if (categoryRepository.count() == 0) {
            categoryRepository.save(Category.builder().name("Food & Dining").type(Category.Type.EXPENSE).isDefault(true).icon("utensils").color("#ef4444").build());
            categoryRepository.save(Category.builder().name("Shopping").type(Category.Type.EXPENSE).isDefault(true).icon("shopping-bag").color("#3b82f6").build());
            categoryRepository.save(Category.builder().name("Housing").type(Category.Type.EXPENSE).isDefault(true).icon("home").color("#8b5cf6").build());
            categoryRepository.save(Category.builder().name("Salary").type(Category.Type.INCOME).isDefault(true).icon("briefcase").color("#22c55e").build());
            categoryRepository.save(Category.builder().name("Investment").type(Category.Type.INCOME).isDefault(true).icon("trending-up").color("#10b981").build());
        }
    }
}
