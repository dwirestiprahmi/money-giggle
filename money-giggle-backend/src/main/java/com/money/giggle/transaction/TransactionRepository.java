package com.money.giggle.transaction;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, UUID> {

    @Query("""
        SELECT t FROM Transaction t
        LEFT JOIN FETCH t.category c
        WHERE t.user.id = :userId
          AND (:type IS NULL OR t.type = :type)
          AND (:categoryId IS NULL OR c.id = :categoryId)
          AND (:from IS NULL OR t.date >= :from)
          AND (:to IS NULL OR t.date <= :to)
        ORDER BY t.date DESC, t.createdAt DESC
    """)
    Page<Transaction> findFiltered(
            @Param("userId") UUID userId,
            @Param("type") TransactionType type,
            @Param("categoryId") UUID categoryId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to,
            Pageable pageable);

    Optional<Transaction> findByIdAndUserId(UUID id, UUID userId);

    // For budget spend calculation
    @Query("""
        SELECT COALESCE(SUM(t.amountBase), 0)
        FROM Transaction t
        WHERE t.user.id = :userId
          AND t.category.id = :categoryId
          AND t.type = 'EXPENSE'
          AND t.date >= :from
          AND t.date <= :to
    """)
    BigDecimal sumSpentByCategory(
            @Param("userId") UUID userId,
            @Param("categoryId") UUID categoryId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to);

    // For reports - total income/expense in period
    @Query("""
        SELECT COALESCE(SUM(t.amountBase), 0)
        FROM Transaction t
        WHERE t.user.id = :userId
          AND t.type = :type
          AND t.date >= :from
          AND t.date <= :to
    """)
    BigDecimal sumByTypeAndPeriod(
            @Param("userId") UUID userId,
            @Param("type") TransactionType type,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to);

    // For category breakdown report
    @Query("""
        SELECT t.category.name, t.category.color, t.category.icon,
               SUM(t.amountBase) as total, COUNT(t) as count
        FROM Transaction t
        WHERE t.user.id = :userId
          AND t.type = :type
          AND t.date >= :from
          AND t.date <= :to
        GROUP BY t.category.id, t.category.name, t.category.color, t.category.icon
        ORDER BY total DESC
    """)
    List<Object[]> categoryBreakdown(
            @Param("userId") UUID userId,
            @Param("type") TransactionType type,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to);

    // Monthly trend (last 12 months)
    @Query(value = """
        SELECT TO_CHAR(date, 'YYYY-MM') as month,
               type,
               SUM(amount_base) as total
        FROM transactions
        WHERE user_id = :userId
          AND date >= :from
        GROUP BY TO_CHAR(date, 'YYYY-MM'), type
        ORDER BY month ASC
    """, nativeQuery = true)
    List<Object[]> monthlyTrend(
            @Param("userId") UUID userId,
            @Param("from") LocalDate from);
}