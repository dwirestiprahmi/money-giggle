package com.money.giggle.recurring;

import com.money.giggle.common.response.ApiResponse;
import com.money.giggle.user.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/recurring")
@RequiredArgsConstructor
public class RecurringController {

    private final RecurringService recurringService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<RecurringRule>>> getAll(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.ok(recurringService.getAllForUser(user)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<RecurringRule>> create(
            @Valid @RequestBody RecurringRuleRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(recurringService.create(request, user)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deactivate(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user) {
        recurringService.deactivate(id, user);
        return ResponseEntity.ok(ApiResponse.ok("Recurring rule deactivated", null));
    }
}
