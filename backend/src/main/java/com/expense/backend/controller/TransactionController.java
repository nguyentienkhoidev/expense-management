package com.expense.backend.controller;

import com.expense.backend.dto.TransactionRequest;
import com.expense.backend.dto.TransactionResponse;
import com.expense.backend.security.UserDetailsImpl;
import com.expense.backend.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpHeaders;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    private Long getUserId(Authentication auth) {
        return ((UserDetailsImpl) auth.getPrincipal()).getId();
    }

    @GetMapping
    public ResponseEntity<Page<TransactionResponse>> getTransactions(
            @RequestParam(required = false) Long walletId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String type,
            @PageableDefault(sort = "transactionDate", direction = Sort.Direction.DESC, size = 20) Pageable pageable,
            Authentication auth) {
        return ResponseEntity.ok(transactionService.getUserTransactions(getUserId(auth), walletId, search, type, pageable));
    }

    @PostMapping
    public ResponseEntity<TransactionResponse> createTransaction(
            @Valid @RequestBody TransactionRequest request, 
            Authentication auth) {
        return ResponseEntity.ok(transactionService.createTransaction(getUserId(auth), request));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTransaction(@PathVariable Long id, Authentication auth) {
        transactionService.deleteTransaction(getUserId(auth), id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/export")
    public ResponseEntity<byte[]> exportTransactions(
            @RequestParam(required = false) Long walletId,
            Authentication auth) {
        byte[] csvData = transactionService.exportUserTransactions(getUserId(auth), walletId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=transactions.csv")
                .header(HttpHeaders.CONTENT_TYPE, "text/csv; charset=UTF-8")
                .body(csvData);
    }
}
