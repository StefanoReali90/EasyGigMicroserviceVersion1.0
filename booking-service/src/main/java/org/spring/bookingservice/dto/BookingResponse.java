package org.spring.bookingservice.dto;

import org.spring.bookingservice.utility.BookingSlotState;

import java.time.LocalDateTime;

public record BookingResponse(
        Long bookingId,
        Long slotId,
        Long userId,
        Long venueId,
        BookingSlotState status,
        LocalDateTime createdAt
) {
}
