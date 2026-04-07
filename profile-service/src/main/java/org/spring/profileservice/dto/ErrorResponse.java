package org.spring.profileservice.dto;

import java.time.LocalDateTime;

public record ErrorResponse (
        int status,
        String message,
        LocalDateTime timestamp

){

}
