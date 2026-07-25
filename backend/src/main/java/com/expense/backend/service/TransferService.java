package com.expense.backend.service;

import com.expense.backend.dto.TransferRequest;
import com.expense.backend.dto.TransferResponse;
import com.expense.backend.dto.WalletResponse;
import com.expense.backend.entity.Transfer;
import com.expense.backend.entity.Wallet;
import com.expense.backend.repository.TransferRepository;
import com.expense.backend.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import com.expense.backend.exception.AppException;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TransferService {
    
    private final TransferRepository transferRepository;
    private final WalletRepository walletRepository;

    public List<TransferResponse> getUserTransfers(Long userId) {
        List<Transfer> transfers = transferRepository.findByUserIdOrderByTransferDateDesc(userId);
        
        Map<Long, Wallet> walletMap = walletRepository.findByUserId(userId).stream()
                .collect(Collectors.toMap(Wallet::getId, w -> w));
                
        return transfers.stream()
                .map(t -> mapToResponse(t, walletMap.get(t.getFromWalletId()), walletMap.get(t.getToWalletId())))
                .collect(Collectors.toList());
    }

    @Transactional
    public TransferResponse createTransfer(Long userId, TransferRequest request) {
        Wallet fromWallet = walletRepository.findById(request.getFromWalletId())
                .orElseThrow(() -> new AppException("error.wallet.notFound"));
                
        Wallet toWallet = walletRepository.findById(request.getToWalletId())
                .orElseThrow(() -> new AppException("error.wallet.notFound"));

        if (!fromWallet.getUserId().equals(userId) || !toWallet.getUserId().equals(userId)) {
            throw new AppException("error.unauthorized", HttpStatus.FORBIDDEN);
        }

        if (fromWallet.getId().equals(toWallet.getId())) {
            throw new AppException("error.transfer.sameWallet");
        }

        if (fromWallet.getBalance().compareTo(request.getAmount()) < 0) {
            throw new AppException("error.transfer.insufficientBalance");
        }

        // Update balances
        fromWallet.setBalance(fromWallet.getBalance().subtract(request.getAmount()));
        toWallet.setBalance(toWallet.getBalance().add(request.getAmount()));
        
        walletRepository.save(fromWallet);
        walletRepository.save(toWallet);

        Transfer transfer = Transfer.builder()
                .amount(request.getAmount())
                .transferDate(request.getTransferDate())
                .note(request.getNote())
                .fromWalletId(fromWallet.getId())
                .toWalletId(toWallet.getId())
                .userId(userId)
                .build();

        Transfer savedTransfer = transferRepository.save(transfer);
        return mapToResponse(savedTransfer, fromWallet, toWallet);
    }

    private TransferResponse mapToResponse(Transfer transfer, Wallet fromWallet, Wallet toWallet) {
        WalletResponse fromWalletResponse = null;
        if (fromWallet != null) {
            fromWalletResponse = WalletResponse.builder()
                    .id(fromWallet.getId())
                    .name(fromWallet.getName())
                    .type(fromWallet.getType())
                    .balance(fromWallet.getBalance())
                    .build();
        }
        
        WalletResponse toWalletResponse = null;
        if (toWallet != null) {
            toWalletResponse = WalletResponse.builder()
                    .id(toWallet.getId())
                    .name(toWallet.getName())
                    .type(toWallet.getType())
                    .balance(toWallet.getBalance())
                    .build();
        }

        return TransferResponse.builder()
                .id(transfer.getId())
                .amount(transfer.getAmount())
                .transferDate(transfer.getTransferDate())
                .note(transfer.getNote())
                .fromWallet(fromWalletResponse)
                .toWallet(toWalletResponse)
                .build();
    }
}
