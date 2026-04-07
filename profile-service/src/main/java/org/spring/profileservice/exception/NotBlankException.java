package org.spring.profileservice.exception;

public class NotBlankException extends RuntimeException {
    public NotBlankException(String message) {
        super(message);
    }
}
