package org.spring.bookingservice.dto;

public record BookingExpiredEvent(
        Long bookingId,
        Long userId,
        Long slotId,
        Long venueId

) {
}
