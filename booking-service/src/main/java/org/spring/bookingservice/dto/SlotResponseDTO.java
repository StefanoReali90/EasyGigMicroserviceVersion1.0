package org.spring.bookingservice.dto;

import org.spring.bookingservice.utility.SlotState;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record SlotResponseDTO(
        Long id,
        LocalDateTime start,
        LocalDateTime end,
        SlotState state,
        Long venueId
) {
}
