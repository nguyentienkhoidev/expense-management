package com.expense.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);
    
    // We are autowiring it but if smtp is dummy it will fail on send if used for real.
    // For development we will just log the content instead of actually sending.
    
    public void sendPasswordResetEmail(String to, String token) {
        String resetUrl = "http://localhost:5173/reset-password?token=" + token;
        
        logger.info("\n\n=======================================================");
        logger.info("PASSWORD RESET EMAIL INTERCEPTED (DEV MODE)");
        logger.info("To: " + to);
        logger.info("Subject: Password Reset Request");
        logger.info("Link: " + resetUrl);
        logger.info("=======================================================\n\n");
    }
}
