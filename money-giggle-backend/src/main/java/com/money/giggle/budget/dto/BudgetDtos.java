package com.money.giggle.budget.dto;

import com.money.giggle.budget.BudgetPeriod;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public class BudgetDtos {

    @Data
    public static class BudgetRequest {
        @NotNull private BudgetPeriod period;

        @NotNull @DecimalMin("0.01")
        private BigDecimal limitAmount;

        @NotBlank @Size(min = 3, max = 3)
        private String currency;

        private UUID categoryId;
        private LocalDate startDate;
    }

    @Data
    public static class BudgetResponse {
        private UUID id;
        private BudgetPeriod period;
        private BigDecimal limitAmount;
        private String currency;
        private BigDecimal spentAmount;
        private BigDecimal remainingAmount;
        private BigDecimal percentageUsed;
        private LocalDate startDate;
        private LocalDate periodStart;
        private LocalDate periodEnd;
        private CategoryInfo category;

        @Data
        public static class CategoryInfo {
            private UUID id;
            private String name;
            private String icon;
            private String color;
        }
    }
}