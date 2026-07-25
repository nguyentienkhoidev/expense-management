package com.expense.backend.repository;

import com.expense.backend.entity.Transfer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TransferRepository extends JpaRepository<Transfer, Long> {
    List<Transfer> findByUserId(Long userId);
    List<Transfer> findByUserIdOrderByTransferDateDesc(Long userId);
}
