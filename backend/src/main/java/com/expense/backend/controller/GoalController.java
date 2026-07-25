package com.expense.backend.controller;

import com.expense.backend.dto.GoalRequest;
import com.expense.backend.dto.GoalResponse;
import com.expense.backend.security.UserDetailsImpl;
import com.expense.backend.service.GoalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/goals")
@RequiredArgsConstructor
public class GoalController {

    private final GoalService goalService;

    private Long getUserId(Authentication auth) {
        return ((UserDetailsImpl) auth.getPrincipal()).getId();
    }

    @GetMapping
    public ResponseEntity<List<GoalResponse>> getGoals(Authentication auth) {
        return ResponseEntity.ok(goalService.getUserGoals(getUserId(auth)));
    }

    @PostMapping
    public ResponseEntity<GoalResponse> createGoal(@Valid @RequestBody GoalRequest request, Authentication auth) {
        return ResponseEntity.ok(goalService.createGoal(getUserId(auth), request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteGoal(@PathVariable Long id, Authentication auth) {
        goalService.deleteGoal(getUserId(auth), id);
        return ResponseEntity.ok().build();
    }
}
