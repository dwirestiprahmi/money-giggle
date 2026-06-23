package com.money.giggle.recurring;

import com.money.giggle.transaction.TransactionType;
import jakarta.validation.constraints.*;
        import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class RecurringRuleRequest {
    @NotNull private TransactionType type;

    @NotNull @DecimalMin("0.01")
    private BigDecimal amount;

    @NotBlank @Size(min = 3, max = 3)
    private String currency;

    private UUID categoryId;
    private String description;

    @NotNull private Frequency frequency;

    @NotNull private LocalDate startDate;
}
