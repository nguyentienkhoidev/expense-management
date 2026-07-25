package com.expense.backend.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class AppException extends RuntimeException {
    private final String messageKey;
    private final HttpStatus status;
    private final Object[] args;

    public AppException(String messageKey) {
        this(messageKey, HttpStatus.BAD_REQUEST, null);
    }

    public AppException(String messageKey, HttpStatus status) {
        this(messageKey, status, null);
    }

    public AppException(String messageKey, Object[] args) {
        this(messageKey, HttpStatus.BAD_REQUEST, args);
    }

    public AppException(String messageKey, HttpStatus status, Object[] args) {
        super(messageKey);
        this.messageKey = messageKey;
        this.status = status;
        this.args = args;
    }
}
