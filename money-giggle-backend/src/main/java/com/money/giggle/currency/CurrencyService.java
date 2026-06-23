package com.money.giggle.currency;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class CurrencyService {

    private final WebClient.Builder webClientBuilder;

    @Value("${app.currency.api-url}")
    private String apiUrl;

    @Value("${app.currency.cache-ttl-minutes}")
    private long cacheTtlMinutes;

    // Simple in-memory cache: base -> (rates, fetchTime)
    private final Map<String, CacheEntry> ratesCache = new ConcurrentHashMap<>();

    public Map<String, Double> getRates(String baseCurrency) {
        String base = baseCurrency.toUpperCase();
        CacheEntry cached = ratesCache.get(base);

        if (cached != null && !cached.isExpired(cacheTtlMinutes)) {
            return cached.rates();
        }

        try {
            ExchangeRateResponse response = webClientBuilder.build()
                    .get()
                    .uri(apiUrl + "/" + base)
                    .retrieve()
                    .bodyToMono(ExchangeRateResponse.class)
                    .block();

            if (response != null && response.rates() != null) {
                ratesCache.put(base, new CacheEntry(response.rates(), Instant.now()));
                return response.rates();
            }
        } catch (Exception e) {
            log.warn("Failed to fetch exchange rates for {}: {}", base, e.getMessage());
            if (cached != null) return cached.rates(); // return stale on failure
        }

        return Map.of(base, 1.0);
    }

    public BigDecimal convertToBase(BigDecimal amount, String fromCurrency, String baseCurrency) {
        if (fromCurrency.equalsIgnoreCase(baseCurrency)) return amount;

        Map<String, Double> rates = getRates(baseCurrency);
        Double rate = rates.get(fromCurrency.toUpperCase());

        if (rate == null || rate == 0) {
            log.warn("No exchange rate found for {} -> {}, using 1:1", fromCurrency, baseCurrency);
            return amount;
        }

        return amount.divide(BigDecimal.valueOf(rate), 2, RoundingMode.HALF_UP);
    }

    public BigDecimal convert(BigDecimal amount, String from, String to) {
        if (from.equalsIgnoreCase(to)) return amount;
        Map<String, Double> rates = getRates(from);
        Double rate = rates.get(to.toUpperCase());
        if (rate == null) return amount;
        return amount.multiply(BigDecimal.valueOf(rate)).setScale(2, RoundingMode.HALF_UP);
    }

    record CacheEntry(Map<String, Double> rates, Instant fetchedAt) {
        boolean isExpired(long ttlMinutes) {
            return Instant.now().isAfter(fetchedAt.plusSeconds(ttlMinutes * 60));
        }
    }

    record ExchangeRateResponse(String base, Map<String, Double> rates) {}
}

