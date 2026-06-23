package com.money.giggle.recurring;

import com.money.giggle.category.CategoryRepository;
import com.money.giggle.common.exception.ResourceNotFoundException;
import com.money.giggle.currency.CurrencyService;
import com.money.giggle.recurring.RecurringRepository;
import com.money.giggle.recurring.RecurringRule;
import com.money.giggle.transaction.Transaction;
import com.money.giggle.transaction.TransactionRepository;
import com.money.giggle.user.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class RecurringService {

    private final RecurringRepository recurringRepository;
    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;
    private final CurrencyService currencyService;

    public List<RecurringRule> getAllForUser(User user) {
        return recurringRepository.findByUserIdAndActiveTrue(user.getId());
    }

    @Transactional
    public RecurringRule create(RecurringRuleRequest request, User user) {
        var category = request.getCategoryId() != null
                ? categoryRepository.findById(request.getCategoryId()).orElse(null)
                : null;

        RecurringRule rule = RecurringRule.builder()
                .user(user)
                .category(category)
                .type(request.getType())
                .amount(request.getAmount())
                .currency(request.getCurrency())
                .description(request.getDescription())
                .frequency(request.getFrequency())
                .nextRunAt(request.getStartDate())
                .active(true)
                .build();

        return recurringRepository.save(rule);
    }

    @Transactional
    public void deactivate(UUID id, User user) {
        RecurringRule rule = recurringRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("RecurringRule", id.toString()));
        rule.setActive(false);
        recurringRepository.save(rule);
    }

    // Runs every day at 01:00 AM
    @Scheduled(cron = "0 0 1 * * *")
    @Transactional
    public void processDueRules() {
        LocalDate today = LocalDate.now();
        List<RecurringRule> dueRules = recurringRepository.findDueRules(today);
        log.info("Processing {} due recurring rules", dueRules.size());

        for (RecurringRule rule : dueRules) {
            try {
                createTransactionFromRule(rule);
                rule.setNextRunAt(calculateNextRun(rule.getNextRunAt(), rule.getFrequency()));
                recurringRepository.save(rule);
            } catch (Exception e) {
                log.error("Failed to process recurring rule {}: {}", rule.getId(), e.getMessage());
            }
        }
    }

    private void createTransactionFromRule(RecurringRule rule) {
        User user = rule.getUser();
        BigDecimal amountBase = currencyService.convertToBase(
                rule.getAmount(), rule.getCurrency(), user.getDefaultCurrency());

        Transaction tx = Transaction.builder()
                .user(user)
                .category(rule.getCategory())
                .recurringRule(rule)
                .type(rule.getType())
                .amount(rule.getAmount())
                .currency(rule.getCurrency())
                .amountBase(amountBase)
                .date(rule.getNextRunAt())
                .description(rule.getDescription() != null
                        ? rule.getDescription() : "Recurring: " + rule.getFrequency())
                .build();

        transactionRepository.save(tx);
    }

    private LocalDate calculateNextRun(LocalDate current, Frequency frequency) {
        return switch (frequency) {
            case DAILY -> current.plusDays(1);
            case WEEKLY -> current.plusWeeks(1);
            case MONTHLY -> current.plusMonths(1);
            case YEARLY -> current.plusYears(1);
        };
    }
}