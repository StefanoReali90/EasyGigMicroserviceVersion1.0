package org.spring.bookingservice.dto;

import java.time.LocalDate;
import java.util.Map;

public record CalendarResponseDTO(
        Long venueId,
        int month,
        int year,
        Map<LocalDate, String> availabilityMap
) {
}
