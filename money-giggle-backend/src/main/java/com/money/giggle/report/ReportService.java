package com.money.giggle.report;

import com.money.giggle.transaction.TransactionRepository;
import com.money.giggle.transaction.TransactionType;
import com.money.giggle.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final TransactionRepository transactionRepository;

    public Map<String, Object> getSummary(User user, LocalDate from, LocalDate to) {
        BigDecimal totalIncome = transactionRepository.sumByTypeAndPeriod(
                user.getId(), TransactionType.INCOME, from, to);
        BigDecimal totalExpense = transactionRepository.sumByTypeAndPeriod(
                user.getId(), TransactionType.EXPENSE, from, to);
        BigDecimal netBalance = totalIncome.subtract(totalExpense);

        return Map.of(
                "from", from,
                "to", to,
                "totalIncome", totalIncome,
                "totalExpense", totalExpense,
                "netBalance", netBalance,
                "savingsRate", totalIncome.compareTo(BigDecimal.ZERO) > 0
                        ? netBalance.multiply(BigDecimal.valueOf(100))
                          .divide(totalIncome, 1, java.math.RoundingMode.HALF_UP)
                        : BigDecimal.ZERO
        );
    }

    public List<Map<String, Object>> getCategoryBreakdown(
            User user, TransactionType type, LocalDate from, LocalDate to) {

        List<Object[]> rows = transactionRepository.categoryBreakdown(
                user.getId(), type, from, to);

        return rows.stream().map(row -> {
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("categoryName", row[0]);
            entry.put("color", row[1]);
            entry.put("icon", row[2]);
            entry.put("total", row[3]);
            entry.put("count", row[4]);
            return entry;
        }).toList();
    }

    public List<Map<String, Object>> getMonthlyTrend(User user, int months) {
        LocalDate from = LocalDate.now().minusMonths(months).withDayOfMonth(1);
        List<Object[]> rows = transactionRepository.monthlyTrend(user.getId(), from);

        return rows.stream().map(row -> {
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("month", row[0]);
            entry.put("type", row[1]);
            entry.put("total", row[2]);
            return entry;
        }).toList();
    }
}
