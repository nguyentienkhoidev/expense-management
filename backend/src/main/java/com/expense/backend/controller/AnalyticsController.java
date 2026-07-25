package com.expense.backend.controller;

import com.expense.backend.security.UserDetailsImpl;
import com.expense.backend.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    private Long getUserId(Authentication auth) {
        return ((UserDetailsImpl) auth.getPrincipal()).getId();
    }

    @GetMapping("/cashflow")
    public ResponseEntity<List<Map<String, Object>>> getCashflow(
            @RequestParam(defaultValue = "7") int months,
            Authentication auth) {
        return ResponseEntity.ok(analyticsService.getCashflow(getUserId(auth), months));
    }
}
