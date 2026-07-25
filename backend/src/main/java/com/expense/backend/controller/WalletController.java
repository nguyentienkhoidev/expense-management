package com.expense.backend.controller;

import com.expense.backend.dto.WalletRequest;
import com.expense.backend.dto.WalletResponse;
import com.expense.backend.security.UserDetailsImpl;
import com.expense.backend.service.WalletService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wallets")
@RequiredArgsConstructor
public class WalletController {

    private final WalletService walletService;

    private Long getUserId(Authentication auth) {
        return ((UserDetailsImpl) auth.getPrincipal()).getId();
    }

    @GetMapping
    public ResponseEntity<List<WalletResponse>> getWallets(Authentication auth) {
        return ResponseEntity.ok(walletService.getUserWallets(getUserId(auth)));
    }

    @PostMapping
    public ResponseEntity<WalletResponse> createWallet(@Valid @RequestBody WalletRequest request, Authentication auth) {
        return ResponseEntity.ok(walletService.createWallet(getUserId(auth), request));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateWallet(@PathVariable Long id, @Valid @RequestBody WalletRequest request, Authentication auth) {
        try {
            return ResponseEntity.ok(walletService.updateWallet(getUserId(auth), id, request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteWallet(@PathVariable Long id, Authentication auth) {
        walletService.deleteWallet(getUserId(auth), id);
        return ResponseEntity.ok().build();
    }
    
    @PutMapping("/{id}/toggle-status")
    public ResponseEntity<WalletResponse> toggleStatus(@PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(walletService.toggleWalletStatus(getUserId(auth), id));
    }
}
