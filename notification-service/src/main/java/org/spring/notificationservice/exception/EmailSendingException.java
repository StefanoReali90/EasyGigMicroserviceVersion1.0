package org.spring.notificationservice.exception;

public class EmailSendingException extends RuntimeException {
    public EmailSendingException(String message, Exception e) {
        super(message);
    }
}
