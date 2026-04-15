package org.spring.notificationservice.handler;


import org.spring.notificationservice.exception.EmailSendingException;
import org.spring.notificationservice.dto.ErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler({
            EmailSendingException.class,
            Exception.class
    })
    public ResponseEntity<ErrorResponse> handleAllExceptions(Exception ex) {

        HttpStatus status = switch (ex) {
            case EmailSendingException e -> HttpStatus.INTERNAL_SERVER_ERROR;
            default -> HttpStatus.INTERNAL_SERVER_ERROR;
        };

        String message = (status == HttpStatus.INTERNAL_SERVER_ERROR)
                ? "Si è verificato un errore imprevisto"
                : ex.getMessage();

        ErrorResponse error = new ErrorResponse(
                status.value(),
                message,
                LocalDateTime.now()
        );

        return new ResponseEntity<>(error, status);
    }
}
