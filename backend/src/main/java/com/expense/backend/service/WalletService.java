package com.expense.backend.service;

import com.expense.backend.dto.WalletRequest;
import com.expense.backend.dto.WalletResponse;
import com.expense.backend.entity.User;
import com.expense.backend.entity.Wallet;
import com.expense.backend.repository.TransactionRepository;
import com.expense.backend.repository.UserRepository;
import com.expense.backend.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import com.expense.backend.exception.AppException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WalletService {
    private final WalletRepository walletRepository;
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;

    public List<WalletResponse> getUserWallets(Long userId) {
        return walletRepository.findByUserId(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public WalletResponse createWallet(Long userId, WalletRequest request) {
        Wallet wallet = Wallet.builder()
                .name(request.getName())
                .type(request.getType())
                .balance(request.getBalance())
                .icon(request.getIcon())
                .userId(userId)
                .isActive(true)
                .build();

        Wallet saved = walletRepository.save(wallet);
        return mapToResponse(saved);
    }
    
    public WalletResponse updateWallet(Long userId, Long walletId, WalletRequest request) {
        Wallet wallet = walletRepository.findById(walletId)
                .orElseThrow(() -> new AppException("error.wallet.notFound"));
        if (!wallet.getUserId().equals(userId)) {
            throw new AppException("error.unauthorized", HttpStatus.FORBIDDEN);
        }
        
        wallet.setName(request.getName());
        wallet.setType(request.getType());
        wallet.setBalance(request.getBalance());
        wallet.setIcon(request.getIcon());
        
        Wallet saved = walletRepository.save(wallet);
        return mapToResponse(saved);
    }
    
    public void deleteWallet(Long userId, Long walletId) {
        Wallet wallet = walletRepository.findById(walletId)
                .orElseThrow(() -> new AppException("error.wallet.notFound"));
        if (!wallet.getUserId().equals(userId)) {
            throw new AppException("error.unauthorized", HttpStatus.FORBIDDEN);
        }
        if (transactionRepository.existsByWalletId(walletId)) {
            throw new AppException("error.wallet.deleteHasTransactions");
        }
        walletRepository.delete(wallet);
    }
    
    public WalletResponse toggleWalletStatus(Long userId, Long walletId) {
        Wallet wallet = walletRepository.findById(walletId)
                .orElseThrow(() -> new AppException("error.wallet.notFound"));
        if (!wallet.getUserId().equals(userId)) {
            throw new AppException("error.unauthorized", HttpStatus.FORBIDDEN);
        }
        
        wallet.setIsActive(!Boolean.TRUE.equals(wallet.getIsActive()));
        Wallet saved = walletRepository.save(wallet);
        return mapToResponse(saved);
    }

    private WalletResponse mapToResponse(Wallet wallet) {
        return WalletResponse.builder()
                .id(wallet.getId())
                .name(wallet.getName())
                .type(wallet.getType())
                .balance(wallet.getBalance())
                .isActive(wallet.getIsActive())
                .icon(wallet.getIcon())
                .build();
    }
}
