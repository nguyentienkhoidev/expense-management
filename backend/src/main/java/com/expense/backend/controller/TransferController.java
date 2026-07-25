package com.expense.backend.controller;

import com.expense.backend.dto.TransferRequest;
import com.expense.backend.dto.TransferResponse;
import com.expense.backend.security.UserDetailsImpl;
import com.expense.backend.service.TransferService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transfers")
@RequiredArgsConstructor
public class TransferController {

    private final TransferService transferService;

    private Long getUserId(Authentication auth) {
        return ((UserDetailsImpl) auth.getPrincipal()).getId();
    }

    @GetMapping
    public ResponseEntity<List<TransferResponse>> getTransfers(Authentication auth) {
        return ResponseEntity.ok(transferService.getUserTransfers(getUserId(auth)));
    }

    @PostMapping
    public ResponseEntity<TransferResponse> createTransfer(@Valid @RequestBody TransferRequest request, Authentication auth) {
        return ResponseEntity.ok(transferService.createTransfer(getUserId(auth), request));
    }
}
