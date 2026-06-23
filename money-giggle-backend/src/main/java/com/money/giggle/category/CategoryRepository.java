package com.money.giggle.category;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CategoryRepository extends JpaRepository<Category, UUID> {

    // Returns system defaults + user's own categories
    @Query("""
        SELECT c FROM Category c
        WHERE c.user IS NULL
           OR c.user.id = :userId
        ORDER BY c.isDefault DESC, c.name ASC
    """)
    List<Category> findAllForUser(@Param("userId") UUID userId);

    boolean existsByNameAndUserId(String name, UUID userId);
}

