package com.expense.backend.service;

import com.expense.backend.dto.CategoryResponse;
import com.expense.backend.dto.TransactionRequest;
import com.expense.backend.dto.TransactionResponse;
import com.expense.backend.dto.WalletResponse;
import com.expense.backend.entity.Category;
import com.expense.backend.entity.Transaction;
import com.expense.backend.entity.User;
import com.expense.backend.entity.Wallet;
import com.expense.backend.repository.CategoryRepository;
import com.expense.backend.repository.TransactionRepository;
import com.expense.backend.repository.UserRepository;
import com.expense.backend.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import com.expense.backend.exception.AppException;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TransactionService {
    private final TransactionRepository transactionRepository;
    private final WalletRepository walletRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public Page<TransactionResponse> getUserTransactions(Long userId, Long walletId, String search, String typeStr, Pageable pageable) {
        Category.Type type = null;
        if (typeStr != null && !typeStr.isEmpty() && !typeStr.equalsIgnoreCase("ALL")) {
            try { type = Category.Type.valueOf(typeStr.toUpperCase()); } catch (Exception e) {}
        }
        
        String searchQuery = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        
        Page<Transaction> transactions = transactionRepository.findTransactionsWithSearch(
                userId, walletId, type, searchQuery, pageable);
        
        // Batch fetching to avoid N+1
        Map<Long, Wallet> walletMap = walletRepository.findByUserId(userId).stream()
                .collect(Collectors.toMap(Wallet::getId, w -> w));
        Map<Long, Category> categoryMap = categoryRepository.findByUserIdOrIsDefaultTrue(userId).stream()
                .collect(Collectors.toMap(Category::getId, c -> c));
        
        return transactions.map(t -> mapToResponse(t, walletMap.get(t.getWalletId()), categoryMap.get(t.getCategoryId())));
    }

    public byte[] exportUserTransactions(Long userId, Long walletId) {
        List<Transaction> transactions;
        if (walletId != null) {
            transactions = transactionRepository.findByUserIdAndWalletIdOrderByTransactionDateDesc(userId, walletId);
        } else {
            transactions = transactionRepository.findByUserIdOrderByTransactionDateDesc(userId);
        }

        Map<Long, Wallet> walletMap = walletRepository.findByUserId(userId).stream()
                .collect(Collectors.toMap(Wallet::getId, w -> w));
        Map<Long, Category> categoryMap = categoryRepository.findByUserIdOrIsDefaultTrue(userId).stream()
                .collect(Collectors.toMap(Category::getId, c -> c));

        StringBuilder sb = new StringBuilder();
        sb.append("Date,Category,Type,Wallet,Note,Amount\n");
        for (Transaction tx : transactions) {
            Category cat = categoryMap.get(tx.getCategoryId());
            Wallet wal = walletMap.get(tx.getWalletId());
            
            sb.append(tx.getTransactionDate()).append(",");
            sb.append("\"").append(cat != null ? cat.getName() : "Unknown").append("\",");
            sb.append(cat != null ? cat.getType() : "Unknown").append(",");
            sb.append("\"").append(wal != null ? wal.getName() : "Unknown").append("\",");
            sb.append("\"").append(tx.getNote() != null ? tx.getNote() : "").append("\",");
            sb.append(tx.getAmount()).append("\n");
        }
        
        return sb.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8);
    }

    @Transactional
    public TransactionResponse createTransaction(Long userId, TransactionRequest request) {
        Wallet wallet = walletRepository.findById(request.getWalletId())
                .orElseThrow(() -> new AppException("error.wallet.notFound"));
                
        if (!wallet.getUserId().equals(userId)) {
            throw new AppException("error.unauthorized", HttpStatus.FORBIDDEN);
        }
        
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new AppException("error.category.notFound"));

        Transaction transaction = Transaction.builder()
                .amount(request.getAmount())
                .note(request.getNote())
                .transactionDate(request.getTransactionDate())
                .walletId(wallet.getId())
                .categoryId(category.getId())
                .userId(userId)
                .build();

        Transaction saved = transactionRepository.save(transaction);
        
        // Update wallet balance
        if (category.getType() == Category.Type.EXPENSE) {
            wallet.setBalance(wallet.getBalance().subtract(request.getAmount()));
        } else {
            wallet.setBalance(wallet.getBalance().add(request.getAmount()));
        }
        walletRepository.save(wallet);

        return mapToResponse(saved, wallet, category);
    }

    @Transactional
    public void deleteTransaction(Long userId, Long transactionId) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new AppException("error.transaction.notFound"));
                
        if (!transaction.getUserId().equals(userId)) {
            throw new AppException("error.unauthorized", HttpStatus.FORBIDDEN);
        }
        
        Wallet wallet = walletRepository.findById(transaction.getWalletId())
                .orElseThrow(() -> new AppException("error.wallet.notFound"));
        Category category = categoryRepository.findById(transaction.getCategoryId())
                .orElseThrow(() -> new AppException("error.category.notFound"));
        
        // Revert wallet balance
        if (category.getType() == Category.Type.EXPENSE) {
            wallet.setBalance(wallet.getBalance().add(transaction.getAmount()));
        } else {
            wallet.setBalance(wallet.getBalance().subtract(transaction.getAmount()));
        }
        walletRepository.save(wallet);
        
        transactionRepository.delete(transaction);
    }

    private TransactionResponse mapToResponse(Transaction transaction, Wallet wallet, Category category) {
        WalletResponse walletResponse = null;
        if (wallet != null) {
            walletResponse = WalletResponse.builder()
                    .id(wallet.getId())
                    .name(wallet.getName())
                    .type(wallet.getType())
                    .balance(wallet.getBalance())
                    .build();
        }
                
        CategoryResponse categoryResponse = null;
        if (category != null) {
            categoryResponse = CategoryResponse.builder()
                    .id(category.getId())
                    .name(category.getName())
                    .type(category.getType())
                    .icon(category.getIcon())
                    .color(category.getColor())
                    .isDefault(category.isDefault())
                    .build();
        }

        return TransactionResponse.builder()
                .id(transaction.getId())
                .amount(transaction.getAmount())
                .note(transaction.getNote())
                .transactionDate(transaction.getTransactionDate())
                .wallet(walletResponse)
                .category(categoryResponse)
                .build();
    }
}
