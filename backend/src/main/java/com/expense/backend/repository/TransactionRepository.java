package com.expense.backend.repository;

import com.expense.backend.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    Page<Transaction> findByUserIdOrderByTransactionDateDesc(Long userId, Pageable pageable);
    Page<Transaction> findByUserIdAndWalletIdOrderByTransactionDateDesc(Long userId, Long walletId, Pageable pageable);
    
    // For non-paginated access like analytics
    List<Transaction> findByUserIdOrderByTransactionDateDesc(Long userId);
    List<Transaction> findByUserIdAndWalletIdOrderByTransactionDateDesc(Long userId, Long walletId);
    boolean existsByCategoryId(Long categoryId);
    boolean existsByWalletId(Long walletId);

    @org.springframework.data.jpa.repository.Query("SELECT t FROM Transaction t JOIN Category c ON t.categoryId = c.id JOIN Wallet w ON t.walletId = w.id " +
           "WHERE t.userId = :userId " +
           "AND (:walletId IS NULL OR t.walletId = :walletId) " +
           "AND (:type IS NULL OR c.type = :type) " +
           "AND (:search IS NULL OR LOWER(COALESCE(t.note, '')) LIKE LOWER(CONCAT('%', cast(:search as String), '%')) " +
           "OR LOWER(c.name) LIKE LOWER(CONCAT('%', cast(:search as String), '%')) " +
           "OR LOWER(w.name) LIKE LOWER(CONCAT('%', cast(:search as String), '%'))) " +
           "ORDER BY t.transactionDate DESC")
    Page<Transaction> findTransactionsWithSearch(
            @org.springframework.data.repository.query.Param("userId") Long userId, 
            @org.springframework.data.repository.query.Param("walletId") Long walletId, 
            @org.springframework.data.repository.query.Param("type") com.expense.backend.entity.Category.Type type, 
            @org.springframework.data.repository.query.Param("search") String search, 
            Pageable pageable);
}
