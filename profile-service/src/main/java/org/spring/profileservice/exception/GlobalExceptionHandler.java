package org.spring.profileservice.exception;

import lombok.extern.slf4j.Slf4j;
import org.spring.profileservice.dto.ErrorResponse;
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
        log.warn("ResponseStatusException [{}] in profile-service: {}", status.value(), message);
        return buildResponse(status, message);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationExceptions(MethodArgumentNotValidException ex) {
        String firstError = ex.getBindingResult().getAllErrors().isEmpty() ? 
                "Dati di input non validi" : 
                ex.getBindingResult().getAllErrors().get(0).getDefaultMessage();
        log.warn("Validation error in profile-service: {}", firstError);
        return buildResponse(HttpStatus.BAD_REQUEST, firstError);
    }

    @ExceptionHandler({
            UserNotFoundException.class,
            EmailGiaEsistenteException.class,
            BandNonTrovataException.class,
            CityNotFoundException.class,
            InvitationNotFoundException.class,
            InvitationAlreadyProcessedException.class,
            InvalidTokenException.class,
            NotBlankException.class,
            MembroNonTrovatoException.class,
            DirectorNotFoundException.class,
            OrganizationNotFoundException.class,
            VenueNotFoundException.class,
            UnauthorizedException.class,
            AccessDeniedException.class,
            IllegalArgumentException.class,
            IllegalStateException.class,
            Exception.class
    })
    public ResponseEntity<ErrorResponse> handleAllExceptions(Exception ex) {
        HttpStatus status;
        if (ex instanceof UserNotFoundException ||
            ex instanceof CityNotFoundException ||
            ex instanceof InvitationNotFoundException ||
            ex instanceof DirectorNotFoundException ||
            ex instanceof OrganizationNotFoundException ||
            ex instanceof VenueNotFoundException) {
            status = HttpStatus.NOT_FOUND;
            log.warn("NotFound Exception [{}] in profile-service: {}", ex.getClass().getSimpleName(), ex.getMessage());
        } else if (ex instanceof EmailGiaEsistenteException || ex instanceof InvitationAlreadyProcessedException) {
            status = HttpStatus.CONFLICT;
            log.warn("Conflict Exception [{}] in profile-service: {}", ex.getClass().getSimpleName(), ex.getMessage());
        } else if (ex instanceof InvalidTokenException || ex instanceof UnauthorizedException) {
            status = HttpStatus.UNAUTHORIZED;
            log.warn("Unauthorized Exception [{}] in profile-service: {}", ex.getClass().getSimpleName(), ex.getMessage());
        } else if (ex instanceof AccessDeniedException) {
            status = HttpStatus.FORBIDDEN;
            log.warn("AccessDenied Exception in profile-service: {}", ex.getMessage());
        } else if (ex instanceof BandNonTrovataException ||
                   ex instanceof NotBlankException ||
                   ex instanceof MembroNonTrovatoException ||
                   ex instanceof IllegalArgumentException ||
                   ex instanceof IllegalStateException) {
            status = HttpStatus.BAD_REQUEST;
            log.warn("BadRequest Exception [{}] in profile-service: {}", ex.getClass().getSimpleName(), ex.getMessage());
        } else {
            status = HttpStatus.INTERNAL_SERVER_ERROR;
            log.error("Unhandled Exception caught in profile-service: ", ex);
        }

        String message = (status == HttpStatus.INTERNAL_SERVER_ERROR)
                ? "Si è verificato un errore imprevisto: " + ex.getMessage()
                : ex.getMessage();

        return buildResponse(status, message);
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