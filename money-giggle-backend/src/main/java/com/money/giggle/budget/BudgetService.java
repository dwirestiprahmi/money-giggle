package com.money.giggle.budget;

import com.money.giggle.budget.dto.BudgetDtos.*;
import com.money.giggle.category.CategoryRepository;
import com.money.giggle.common.exception.ResourceNotFoundException;
import com.money.giggle.transaction.TransactionRepository;
import com.money.giggle.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final CategoryRepository categoryRepository;
    private final TransactionRepository transactionRepository;

    public List<BudgetResponse> getAllForUser(User user) {
        return budgetRepository.findActiveByUserId(user.getId())
                .stream()
                .map(b -> toResponse(b, user))
                .toList();
    }

    @Transactional
    public BudgetResponse create(BudgetRequest request, User user) {
        var category = request.getCategoryId() != null
                ? categoryRepository.findById(request.getCategoryId())
                  .orElseThrow(() -> new ResourceNotFoundException("Category",
                          request.getCategoryId().toString()))
                : null;

        Budget budget = Budget.builder()
                .user(user)
                .category(category)
                .period(request.getPeriod())
                .limitAmount(request.getLimitAmount())
                .currency(request.getCurrency())
                .startDate(request.getStartDate() != null ? request.getStartDate() : LocalDate.now())
                .build();

        return toResponse(budgetRepository.save(budget), user);
    }

    @Transactional
    public void delete(UUID id, User user) {
        Budget budget = budgetRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Budget", id.toString()));
        budget.setActive(false);
        budgetRepository.save(budget);
    }

    private BudgetResponse toResponse(Budget budget, User user) {
        var periodDates = getPeriodDates(budget.getPeriod());
        BigDecimal spent = BigDecimal.ZERO;

        if (budget.getCategory() != null) {
            spent = transactionRepository.sumSpentByCategory(
                    user.getId(),
                    budget.getCategory().getId(),
                    periodDates[0],
                    periodDates[1]);
        }

        BigDecimal percentage = budget.getLimitAmount().compareTo(BigDecimal.ZERO) > 0
                ? spent.divide(budget.getLimitAmount(), 4, RoundingMode.HALF_UP)
                  .multiply(BigDecimal.valueOf(100))
                : BigDecimal.ZERO;

        BudgetResponse resp = new BudgetResponse();
        resp.setId(budget.getId());
        resp.setPeriod(budget.getPeriod());
        resp.setLimitAmount(budget.getLimitAmount());
        resp.setCurrency(budget.getCurrency());
        resp.setSpentAmount(spent);
        resp.setRemainingAmount(budget.getLimitAmount().subtract(spent));
        resp.setPercentageUsed(percentage.setScale(1, RoundingMode.HALF_UP));
        resp.setStartDate(budget.getStartDate());
        resp.setPeriodStart(periodDates[0]);
        resp.setPeriodEnd(periodDates[1]);

        if (budget.getCategory() != null) {
            BudgetResponse.CategoryInfo cat = new BudgetResponse.CategoryInfo();
            cat.setId(budget.getCategory().getId());
            cat.setName(budget.getCategory().getName());
            cat.setIcon(budget.getCategory().getIcon());
            cat.setColor(budget.getCategory().getColor());
            resp.setCategory(cat);
        }
        return resp;
    }

    private LocalDate[] getPeriodDates(BudgetPeriod period) {
        LocalDate today = LocalDate.now();
        return switch (period) {
            case WEEKLY -> new LocalDate[]{
                    today.with(java.time.DayOfWeek.MONDAY),
                    today.with(java.time.DayOfWeek.SUNDAY)};
            case MONTHLY -> new LocalDate[]{
                    today.with(TemporalAdjusters.firstDayOfMonth()),
                    today.with(TemporalAdjusters.lastDayOfMonth())};
            case YEARLY -> new LocalDate[]{
                    today.with(TemporalAdjusters.firstDayOfYear()),
                    today.with(TemporalAdjusters.lastDayOfYear())};
        };
    }
}
