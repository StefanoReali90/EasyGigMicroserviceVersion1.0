package org.spring.notificationservice.handler;

import lombok.extern.slf4j.Slf4j;
import org.spring.notificationservice.dto.ErrorResponse;
import org.spring.notificationservice.exception.EmailSendingException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ErrorResponse> handleResponseStatusException(ResponseStatusException ex) {
        HttpStatus status = HttpStatus.valueOf(ex.getStatusCode().value());
        String message = ex.getReason() != null ? ex.getReason() : ex.getMessage();
        log.warn("ResponseStatusException [{}] in notification-service: {}", status.value(), message);
        return buildResponse(status, message);
    }

    @ExceptionHandler(EmailSendingException.class)
    public ResponseEntity<ErrorResponse> handleEmailSendingException(EmailSendingException ex) {
        log.error("EmailSendingException in notification-service: ", ex);
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Errore durante l'invio dell'email: " + ex.getMessage());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception ex) {
        log.error("Unhandled Exception caught in notification-service: ", ex);
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Si è verificato un errore imprevisto nelle notifiche: " + ex.getMessage());
    }

    private ResponseEntity<ErrorResponse> buildResponse(HttpStatus status, String message) {
        ErrorResponse error = new ErrorResponse(
                status.value(),
                message,
                LocalDateTime.now()
        );
        return new ResponseEntity<>(error, status);
    }
}
