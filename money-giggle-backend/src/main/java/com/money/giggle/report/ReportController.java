package com.money.giggle.report;

import com.money.giggle.common.response.ApiResponse;
import com.money.giggle.transaction.TransactionType;
import com.money.giggle.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSummary(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @AuthenticationPrincipal User user) {

        LocalDate effectiveFrom = from != null ? from
                : LocalDate.now().with(TemporalAdjusters.firstDayOfMonth());
        LocalDate effectiveTo = to != null ? to
                : LocalDate.now().with(TemporalAdjusters.lastDayOfMonth());

        return ResponseEntity.ok(ApiResponse.ok(
                reportService.getSummary(user, effectiveFrom, effectiveTo)));
    }

    @GetMapping("/by-category")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getCategoryBreakdown(
            @RequestParam(defaultValue = "EXPENSE") TransactionType type,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @AuthenticationPrincipal User user) {

        LocalDate effectiveFrom = from != null ? from
                : LocalDate.now().with(TemporalAdjusters.firstDayOfMonth());
        LocalDate effectiveTo = to != null ? to
                : LocalDate.now().with(TemporalAdjusters.lastDayOfMonth());

        return ResponseEntity.ok(ApiResponse.ok(
                reportService.getCategoryBreakdown(user, type, effectiveFrom, effectiveTo)));
    }

    @GetMapping("/trend")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getMonthlyTrend(
            @RequestParam(defaultValue = "12") int months,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.ok(reportService.getMonthlyTrend(user, months)));
    }
}