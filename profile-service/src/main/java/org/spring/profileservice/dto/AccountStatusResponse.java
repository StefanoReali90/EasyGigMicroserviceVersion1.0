package org.spring.profileservice.dto;

import java.time.LocalDateTime;

public record AccountStatusResponse(
        Long userId,
        Integer strikes,
        boolean isBanned,
        LocalDateTime banUntil,
        String statusMessage
) {
}
