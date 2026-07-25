package com.expense.backend.service;

import com.expense.backend.dto.BillRequest;
import com.expense.backend.dto.BillResponse;
import com.expense.backend.dto.PayBillRequest;
import com.expense.backend.entity.Bill;
import com.expense.backend.entity.Category;
import com.expense.backend.entity.Transaction;
import com.expense.backend.entity.User;
import com.expense.backend.entity.Wallet;
import com.expense.backend.repository.BillRepository;
import com.expense.backend.repository.CategoryRepository;
import com.expense.backend.repository.TransactionRepository;
import com.expense.backend.repository.UserRepository;
import com.expense.backend.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import com.expense.backend.exception.AppException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BillService {
    
    private final BillRepository billRepository;
    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final CategoryRepository categoryRepository;
    private final TransactionRepository transactionRepository;

    public List<BillResponse> getUserBills(Long userId) {
        return billRepository.findByUserId(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public BillResponse createBill(Long userId, BillRequest request) {
        Bill bill = Bill.builder()
                .name(request.getName())
                .amount(request.getAmount())
                .dueDate(request.getDueDate())
                .frequency(request.getFrequency())
                .icon(request.getIcon())
                .isPaid(false)
                .userId(userId)
                .build();

        Bill savedBill = billRepository.save(bill);
        return mapToResponse(savedBill);
    }
    
    @Transactional
    public BillResponse payBill(Long userId, Long billId, PayBillRequest request) {
        Bill bill = billRepository.findById(billId)
                .orElseThrow(() -> new AppException("error.bill.notFound"));
                
        if (!bill.getUserId().equals(userId)) {
            throw new AppException("error.unauthorized", HttpStatus.FORBIDDEN);
        }
        
        Wallet wallet = walletRepository.findById(request.getWalletId())
                .orElseThrow(() -> new AppException("error.wallet.notFound"));
                
        if (!wallet.getUserId().equals(userId)) {
            throw new AppException("error.unauthorized", HttpStatus.FORBIDDEN);
        }
        
        if (wallet.getBalance().compareTo(bill.getAmount()) < 0) {
            throw new AppException("error.transfer.insufficientBalance");
        }
        
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new AppException("error.category.notFound"));
                
        if (!category.getUserId().equals(userId) && !category.isDefault()) {
            throw new AppException("error.unauthorized", HttpStatus.FORBIDDEN);
        }
        
        // Create transaction
        Transaction transaction = Transaction.builder()
                .amount(bill.getAmount())
                .note("Paid bill: " + bill.getName())
                .transactionDate(java.time.LocalDate.now())
                .userId(bill.getUserId())
                .walletId(wallet.getId())
                .categoryId(category.getId())
                .build();
        transactionRepository.save(transaction);
        
        // Deduct balance
        wallet.setBalance(wallet.getBalance().subtract(bill.getAmount()));
        walletRepository.save(wallet);
        
        // Update bill status
        if ("ONE_TIME".equals(bill.getFrequency())) {
            bill.setPaid(true);
        } else if ("MONTHLY".equals(bill.getFrequency()) && bill.getDueDate() != null) {
            bill.setDueDate(bill.getDueDate().plusMonths(1));
            bill.setPaid(false); // Reset for next cycle
        } else if ("YEARLY".equals(bill.getFrequency()) && bill.getDueDate() != null) {
            bill.setDueDate(bill.getDueDate().plusYears(1));
            bill.setPaid(false);
        } else {
            bill.setPaid(true);
        }
        
        return mapToResponse(billRepository.save(bill));
    }

    public void deleteBill(Long userId, Long billId) {
        Bill bill = billRepository.findById(billId)
                .orElseThrow(() -> new AppException("error.bill.notFound"));
        if (!bill.getUserId().equals(userId)) {
            throw new AppException("error.unauthorized", HttpStatus.FORBIDDEN);
        }
        billRepository.delete(bill);
    }

    private BillResponse mapToResponse(Bill bill) {
        return BillResponse.builder()
                .id(bill.getId())
                .name(bill.getName())
                .amount(bill.getAmount())
                .dueDate(bill.getDueDate())
                .isPaid(bill.isPaid())
                .frequency(bill.getFrequency())
                .icon(bill.getIcon())
                .build();
    }
}
