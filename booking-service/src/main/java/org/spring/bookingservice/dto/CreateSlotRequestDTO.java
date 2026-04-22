package org.spring.bookingservice.dto;

import java.time.LocalDateTime;

public record CreateSlotRequestDTO(
        Long venueId,
        LocalDateTime start,
        LocalDateTime end
) {
}
