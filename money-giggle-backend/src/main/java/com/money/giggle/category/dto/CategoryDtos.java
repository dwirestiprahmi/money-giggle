package com.money.giggle.category.dto;

import com.money.giggle.category.CategoryType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.UUID;

public class CategoryDtos {

    @Data
    public static class CategoryRequest {
        @NotBlank(message = "Name is required")
        @Size(max = 100)
        private String name;

        private String icon;

        @Size(min = 7, max = 7, message = "Color must be a hex code like #FF6B6B")
        private String color;

        @NotNull(message = "Type is required")
        private CategoryType type;
    }

    @Data
    public static class CategoryResponse {
        private UUID id;
        private String name;
        private String icon;
        private String color;
        private CategoryType type;
        private boolean isDefault;
    }
}
