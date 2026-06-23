package com.money.giggle.category;

import com.money.giggle.category.dto.CategoryDtos.*;
import com.money.giggle.common.exception.AccessDeniedException;
import com.money.giggle.common.exception.ResourceNotFoundException;
import com.money.giggle.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public List<CategoryResponse> getAllForUser(User user) {
        return categoryRepository.findAllForUser(user.getId()).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public CategoryResponse create(CategoryRequest request, User user) {
        if (categoryRepository.existsByNameAndUserId(request.getName(), user.getId())) {
            throw new IllegalArgumentException("Category with this name already exists");
        }

        Category category = Category.builder()
                .user(user)
                .name(request.getName())
                .icon(request.getIcon())
                .color(request.getColor())
                .type(request.getType())
                .isDefault(false)
                .build();

        return toResponse(categoryRepository.save(category));
    }

    @Transactional
    public CategoryResponse update(UUID id, CategoryRequest request, User user) {
        Category category = findOwnedCategory(id, user);
        category.setName(request.getName());
        category.setIcon(request.getIcon());
        category.setColor(request.getColor());
        category.setType(request.getType());
        return toResponse(categoryRepository.save(category));
    }

    @Transactional
    public void delete(UUID id, User user) {
        Category category = findOwnedCategory(id, user);
        categoryRepository.delete(category);
    }

    private Category findOwnedCategory(UUID id, User user) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", id.toString()));
        if (category.isDefault() || !user.getId().equals(category.getUser().getId())) {
            throw new AccessDeniedException("Cannot modify this category");
        }
        return category;
    }

    public CategoryResponse toResponse(Category c) {
        CategoryResponse resp = new CategoryResponse();
        resp.setId(c.getId());
        resp.setName(c.getName());
        resp.setIcon(c.getIcon());
        resp.setColor(c.getColor());
        resp.setType(c.getType());
        resp.setDefault(c.isDefault());
        return resp;
    }
}
