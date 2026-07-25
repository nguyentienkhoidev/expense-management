package com.expense.backend.service;

import com.expense.backend.dto.GoalRequest;
import com.expense.backend.dto.GoalResponse;
import com.expense.backend.entity.Goal;
import com.expense.backend.entity.User;
import com.expense.backend.repository.GoalRepository;
import com.expense.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import com.expense.backend.exception.AppException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GoalService {
    
    private final GoalRepository goalRepository;
    private final UserRepository userRepository;

    public List<GoalResponse> getUserGoals(Long userId) {
        return goalRepository.findByUserId(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public GoalResponse createGoal(Long userId, GoalRequest request) {
        Goal goal = Goal.builder()
                .name(request.getName())
                .targetAmount(request.getTargetAmount())
                .currentAmount(request.getCurrentAmount())
                .targetDate(request.getTargetDate())
                .color(request.getColor() != null ? request.getColor() : "bg-blue-500")
                .icon(request.getIcon())
                .userId(userId)
                .build();

        Goal savedGoal = goalRepository.save(goal);
        return mapToResponse(savedGoal);
    }

    public void deleteGoal(Long userId, Long goalId) {
        Goal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new AppException("error.goal.notFound"));
        if (!goal.getUserId().equals(userId)) {
            throw new AppException("error.unauthorized", HttpStatus.FORBIDDEN);
        }
        goalRepository.delete(goal);
    }

    private GoalResponse mapToResponse(Goal goal) {
        return GoalResponse.builder()
                .id(goal.getId())
                .name(goal.getName())
                .targetAmount(goal.getTargetAmount())
                .currentAmount(goal.getCurrentAmount())
                .targetDate(goal.getTargetDate())
                .color(goal.getColor())
                .icon(goal.getIcon())
                .build();
    }
}
