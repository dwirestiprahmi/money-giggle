package com.money.giggle.currency;

import com.money.giggle.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/currencies")
@RequiredArgsConstructor
public class CurrencyController {

    private final CurrencyService currencyService;

    @GetMapping("/rates")
    public ResponseEntity<ApiResponse<Map<String, Double>>> getRates(
            @RequestParam(defaultValue = "USD") String base) {
        return ResponseEntity.ok(ApiResponse.ok(currencyService.getRates(base)));
    }
}
