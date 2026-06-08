package com.money.giggle;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class MoneyGiggleApplication {
    public static void main(String[] args) {
        SpringApplication.run(MoneyGiggleApplication.class, args);
    }
}
