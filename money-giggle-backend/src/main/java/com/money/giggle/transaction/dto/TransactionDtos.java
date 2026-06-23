package com.money.giggle.transaction.dto;

import com.money.giggle.transaction.TransactionType;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public class TransactionDtos {

    @Data
    public static class TransactionRequest {
        @NotNull(message = "Type is required")
        private TransactionType type;

        @NotNull(message = "Amount is required")
        @DecimalMin(value = "0.01", message = "Amount must be positive")
        @Digits(integer = 13, fraction = 2)
        private BigDecimal amount;

        @NotBlank(message = "Currency is required")
        @Size(min = 3, max = 3)
        private String currency;

        @NotNull(message = "Date is required")
        private LocalDate date;

        private UUID categoryId;
        private String description;
        private String receiptUrl;
    }

    @Data
    public static class TransactionResponse {
        private UUID id;
        private TransactionType type;
        private BigDecimal amount;
        private String currency;
        private BigDecimal amountBase;
        private LocalDate date;
        private String description;
        private String receiptUrl;
        private CategorySummary category;
        private String createdAt;
    }

    @Data
    public static class CategorySummary {
        private UUID id;
        private String name;
        private String icon;
        private String color;
    }

    @Data
    public static class TransactionFilter {
        private TransactionType type;
        private UUID categoryId;
        private LocalDate from;
        private LocalDate to;
        private int page = 0;
        private int size = 20;
    }
}
