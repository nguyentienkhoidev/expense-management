package com.expense.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Entity
@Table(name = "users")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    private String email;

    @Enumerated(EnumType.STRING)
    private AuthProvider authProvider;
    
    // Forgot Password
    private String resetPasswordToken;
    private java.time.LocalDateTime resetPasswordExpiry;

    // 2FA
    @Column(nullable = false, columnDefinition = "boolean default false")
    @Builder.Default
    private boolean isTwoFactorEnabled = false;
    
    private String twoFactorSecret;

    public enum AuthProvider {
        LOCAL, GOOGLE
    }

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private java.time.LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private java.time.LocalDateTime updatedAt;
}
