package org.spring.bookingservice.exception;

import lombok.extern.slf4j.Slf4j;
import org.spring.bookingservice.dto.ErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
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
        log.warn("ResponseStatusException [{}] in booking-service: {}", status.value(), message);
        return buildResponse(status, message);
    }

    @ExceptionHandler(SlotNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleSlotNotFound(SlotNotFoundException ex) {
        log.warn("SlotNotFoundException in booking-service: {}", ex.getMessage());
        return buildResponse(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(BookingRequestNotFound.class)
    public ResponseEntity<ErrorResponse> handleBookingRequestNotFound(BookingRequestNotFound ex) {
        log.warn("BookingRequestNotFound in booking-service: {}", ex.getMessage());
        return buildResponse(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler({
            SlotAlredyBookedException.class,
            BookingNotAllowedException.class,
            SlotNotBeCancelledException.class,
            ReviewNotAllowedException.class,
            IllegalArgumentException.class,
            IllegalStateException.class
    })
    public ResponseEntity<ErrorResponse> handleBadRequestExceptions(RuntimeException ex) {
        log.warn("BadRequestException [{}] in booking-service: {}", ex.getClass().getSimpleName(), ex.getMessage());
        return buildResponse(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationExceptions(MethodArgumentNotValidException ex) {
        String firstError = ex.getBindingResult().getAllErrors().isEmpty() ? 
                "Dati di input non validi" : 
                ex.getBindingResult().getAllErrors().get(0).getDefaultMessage();
        log.warn("Validation error in booking-service: {}", firstError);
        return buildResponse(HttpStatus.BAD_REQUEST, firstError);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception ex) {
        log.error("Unhandled Exception caught in booking-service: ", ex);
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Si è verificato un errore interno: " + ex.getMessage());
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
