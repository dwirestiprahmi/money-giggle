package com.money.giggle.transaction;

import com.money.giggle.category.Category;
import com.money.giggle.category.CategoryRepository;
import com.money.giggle.common.exception.AccessDeniedException;
import com.money.giggle.common.exception.ResourceNotFoundException;
import com.money.giggle.currency.CurrencyService;
import com.money.giggle.transaction.dto.TransactionDtos.*;
import com.money.giggle.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;
    private final CurrencyService currencyService;

    public Page<TransactionResponse> findAll(TransactionFilter filter, User user) {
        PageRequest pageRequest = PageRequest.of(
                filter.getPage(), filter.getSize(),
                Sort.by(Sort.Direction.DESC, "date", "createdAt"));

        return transactionRepository.findFiltered(
                user.getId(),
                filter.getType(),
                filter.getCategoryId(),
                filter.getFrom(),
                filter.getTo(),
                pageRequest
        ).map(this::toResponse);
    }

    public TransactionResponse findById(UUID id, User user) {
        Transaction tx = transactionRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Transaction", id.toString()));
        return toResponse(tx);
    }

    @Transactional
    public TransactionResponse create(TransactionRequest request, User user) {
        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category",
                            request.getCategoryId().toString()));
        }

        BigDecimal amountBase = currencyService.convertToBase(
                request.getAmount(),
                request.getCurrency(),
                user.getDefaultCurrency());

        Transaction tx = Transaction.builder()
                .user(user)
                .category(category)
                .type(request.getType())
                .amount(request.getAmount())
                .currency(request.getCurrency().toUpperCase())
                .amountBase(amountBase)
                .date(request.getDate())
                .description(request.getDescription())
                .receiptUrl(request.getReceiptUrl())
                .build();

        return toResponse(transactionRepository.save(tx));
    }

    @Transactional
    public TransactionResponse update(UUID id, TransactionRequest request, User user) {
        Transaction tx = transactionRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Transaction", id.toString()));

        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category",
                            request.getCategoryId().toString()));
        }

        BigDecimal amountBase = currencyService.convertToBase(
                request.getAmount(),
                request.getCurrency(),
                user.getDefaultCurrency());

        tx.setType(request.getType());
        tx.setAmount(request.getAmount());
        tx.setCurrency(request.getCurrency().toUpperCase());
        tx.setAmountBase(amountBase);
        tx.setDate(request.getDate());
        tx.setDescription(request.getDescription());
        tx.setReceiptUrl(request.getReceiptUrl());
        tx.setCategory(category);

        return toResponse(transactionRepository.save(tx));
    }

    @Transactional
    public void delete(UUID id, User user) {
        Transaction tx = transactionRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Transaction", id.toString()));
        transactionRepository.delete(tx);
    }

    public TransactionResponse toResponse(Transaction tx) {
        TransactionResponse resp = new TransactionResponse();
        resp.setId(tx.getId());
        resp.setType(tx.getType());
        resp.setAmount(tx.getAmount());
        resp.setCurrency(tx.getCurrency());
        resp.setAmountBase(tx.getAmountBase());
        resp.setDate(tx.getDate());
        resp.setDescription(tx.getDescription());
        resp.setReceiptUrl(tx.getReceiptUrl());
        resp.setCreatedAt(tx.getCreatedAt().toString());

        if (tx.getCategory() != null) {
            CategorySummary cat = new CategorySummary();
            cat.setId(tx.getCategory().getId());
            cat.setName(tx.getCategory().getName());
            cat.setIcon(tx.getCategory().getIcon());
            cat.setColor(tx.getCategory().getColor());
            resp.setCategory(cat);
        }
        return resp;
    }
}

