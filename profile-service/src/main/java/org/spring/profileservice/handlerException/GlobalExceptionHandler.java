package org.spring.profileservice.exception;

import org.spring.profileservice.dto.ErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;

@RestControllerAdvice
public class GlobalExceptionHandler {

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
            Exception.class
    })
    public ResponseEntity<ErrorResponse> handleAllExceptions(Exception ex) {

        HttpStatus status = switch (ex) {
            case UserNotFoundException e -> HttpStatus.NOT_FOUND;
            case EmailGiaEsistenteException e -> HttpStatus.CONFLICT;
            case BandNonTrovataException e -> HttpStatus.BAD_REQUEST;
            case CityNotFoundException e -> HttpStatus.NOT_FOUND;
            case InvitationNotFoundException e -> HttpStatus.NOT_FOUND;
            case InvitationAlreadyProcessedException e -> HttpStatus.CONFLICT;
            case InvalidTokenException e -> HttpStatus.UNAUTHORIZED;
            case NotBlankException e -> HttpStatus.BAD_REQUEST;
            case MembroNonTrovatoException e -> HttpStatus.BAD_REQUEST;
            case DirectorNotFoundException e -> HttpStatus.NOT_FOUND;
            case OrganizationNotFoundException e -> HttpStatus.NOT_FOUND;
            case VenueNotFoundException e -> HttpStatus.NOT_FOUND;
            case UnauthorizedException e -> HttpStatus.UNAUTHORIZED;
            case AccessDeniedException e -> HttpStatus.FORBIDDEN;
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