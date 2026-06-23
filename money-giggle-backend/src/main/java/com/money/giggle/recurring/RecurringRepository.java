package com.money.giggle.recurring;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RecurringRepository extends JpaRepository<RecurringRule, UUID> {

    List<RecurringRule> findByUserIdAndActiveTrue(UUID userId);

    Optional<RecurringRule> findByIdAndUserId(UUID id, UUID userId);

    @Query("SELECT r FROM RecurringRule r WHERE r.active = true AND r.nextRunAt <= :today")
    List<RecurringRule> findDueRules(@Param("today") LocalDate today);
}
