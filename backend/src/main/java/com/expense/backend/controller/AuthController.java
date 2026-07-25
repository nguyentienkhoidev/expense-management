package com.expense.backend.controller;

import com.expense.backend.dto.*;
import com.expense.backend.entity.User;
import com.expense.backend.repository.UserRepository;
import com.expense.backend.security.JwtUtils;
import com.expense.backend.security.UserDetailsImpl;
import com.expense.backend.service.EmailService;
import dev.samstevens.totp.code.CodeVerifier;
import dev.samstevens.totp.exceptions.QrGenerationException;
import dev.samstevens.totp.qr.QrData;
import dev.samstevens.totp.qr.QrGenerator;
import dev.samstevens.totp.secret.SecretGenerator;
import dev.samstevens.totp.util.Utils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import com.expense.backend.exception.AppException;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder encoder;
    private final JwtUtils jwtUtils;
    private final EmailService emailService;
    private final SecretGenerator secretGenerator;
    private final QrGenerator qrGenerator;
    private final CodeVerifier codeVerifier;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody AuthRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User user = userRepository.findById(userDetails.getId()).orElseThrow();

        if (user.isTwoFactorEnabled()) {
            return ResponseEntity.ok(AuthResponse.builder()
                    .requiresTwoFactor(true)
                    .build());
        }

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        return ResponseEntity.ok(AuthResponse.builder()
                .token(jwt)
                .id(userDetails.getId())
                .username(userDetails.getUsername())
                .email(userDetails.getEmail())
                .requiresTwoFactor(false)
                .twoFactorEnabled(user.isTwoFactorEnabled())
                .build());
    }

    @PostMapping("/verify-2fa")
    public ResponseEntity<?> verify2fa(@Valid @RequestBody TwoFactorVerifyRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));
                
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User user = userRepository.findById(userDetails.getId()).orElseThrow();
        
        if (!user.isTwoFactorEnabled()) {
            throw new AppException("error.auth.2faNotEnabled");
        }
        
        if (!codeVerifier.isValidCode(user.getTwoFactorSecret(), request.getCode())) {
            throw new AppException("error.auth.invalid2faCode");
        }

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        return ResponseEntity.ok(AuthResponse.builder()
                .token(jwt)
                .id(userDetails.getId())
                .username(userDetails.getUsername())
                .email(userDetails.getEmail())
                .requiresTwoFactor(false)
                .twoFactorEnabled(true)
                .build());
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest signUpRequest) {
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            throw new AppException("error.auth.usernameTaken");
        }

        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            throw new AppException("error.auth.emailInUse");
        }

        User user = User.builder()
                .username(signUpRequest.getUsername())
                .email(signUpRequest.getEmail())
                .password(encoder.encode(signUpRequest.getPassword()))
                .authProvider(User.AuthProvider.LOCAL)
                .isTwoFactorEnabled(false)
                .build();

        userRepository.save(user);

        return ResponseEntity.ok("User registered successfully!");
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        Optional<User> userOptional = userRepository.findByEmail(request.getEmail());
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            String token = UUID.randomUUID().toString();
            user.setResetPasswordToken(token);
            user.setResetPasswordExpiry(LocalDateTime.now().plusHours(1));
            userRepository.save(user);
            
            emailService.sendPasswordResetEmail(user.getEmail(), token);
        }
        // Always return 200 to prevent email enumeration
        return ResponseEntity.ok("If an account exists, a reset link has been sent.");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        Optional<User> userOptional = userRepository.findByResetPasswordToken(request.getToken());
        
        if (userOptional.isEmpty()) {
            throw new AppException("error.invalidToken");
        }
        
        User user = userOptional.get();
        if (user.getResetPasswordExpiry().isBefore(LocalDateTime.now())) {
            throw new AppException("error.tokenExpired");
        }
        
        user.setPassword(encoder.encode(request.getNewPassword()));
        user.setResetPasswordToken(null);
        user.setResetPasswordExpiry(null);
        userRepository.save(user);
        
        return ResponseEntity.ok("Password reset successfully");
    }

    @GetMapping("/2fa/generate")
    public ResponseEntity<?> generate2FA() throws QrGenerationException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User user = userRepository.findById(userDetails.getId()).orElseThrow();
        
        String secret = secretGenerator.generate();
        user.setTwoFactorSecret(secret);
        userRepository.save(user);
        
        QrData data = new QrData.Builder()
                .label(user.getEmail())
                .secret(secret)
                .issuer("Finova")
                .algorithm(dev.samstevens.totp.code.HashingAlgorithm.SHA1)
                .digits(6)
                .period(30)
                .build();
                
        String qrCodeImage = Utils.getDataUriForImage(qrGenerator.generate(data), qrGenerator.getImageMimeType());
        
        return ResponseEntity.ok(TwoFactorGenerateResponse.builder()
                .secret(secret)
                .qrCodeImageBase64(qrCodeImage)
                .build());
    }

    @PostMapping("/2fa/enable")
    public ResponseEntity<?> enable2FA(@Valid @RequestBody TwoFactorEnableRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User user = userRepository.findById(userDetails.getId()).orElseThrow();
        
        if (codeVerifier.isValidCode(user.getTwoFactorSecret(), request.getCode())) {
            user.setTwoFactorEnabled(true);
            userRepository.save(user);
            return ResponseEntity.ok("2FA Enabled successfully");
        } else {
            throw new AppException("error.auth.invalid2faCode");
        }
    }

    @PostMapping("/2fa/disable")
    public ResponseEntity<?> disable2FA() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User user = userRepository.findById(userDetails.getId()).orElseThrow();
        
        user.setTwoFactorEnabled(false);
        user.setTwoFactorSecret(null);
        userRepository.save(user);
        
        return ResponseEntity.ok("2FA Disabled successfully");
    }
}
