package com.expense.backend.controller;

import com.expense.backend.dto.BillRequest;
import com.expense.backend.dto.BillResponse;
import com.expense.backend.security.UserDetailsImpl;
import com.expense.backend.service.BillService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bills")
@RequiredArgsConstructor
public class BillController {

    private final BillService billService;

    private Long getUserId(Authentication auth) {
        return ((UserDetailsImpl) auth.getPrincipal()).getId();
    }

    @GetMapping
    public ResponseEntity<List<BillResponse>> getBills(Authentication auth) {
        return ResponseEntity.ok(billService.getUserBills(getUserId(auth)));
    }

    @PostMapping
    public ResponseEntity<BillResponse> createBill(@Valid @RequestBody BillRequest request, Authentication auth) {
        return ResponseEntity.ok(billService.createBill(getUserId(auth), request));
    }
    
    @PostMapping("/{id}/pay")
    public ResponseEntity<?> payBill(@PathVariable Long id, @Valid @RequestBody com.expense.backend.dto.PayBillRequest request, Authentication auth) {
        try {
            return ResponseEntity.ok(billService.payBill(getUserId(auth), id, request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBill(@PathVariable Long id, Authentication auth) {
        billService.deleteBill(getUserId(auth), id);
        return ResponseEntity.ok().build();
    }
}
