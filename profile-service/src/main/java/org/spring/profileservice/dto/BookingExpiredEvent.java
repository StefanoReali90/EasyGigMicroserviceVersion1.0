package org.spring.profileservice.dto;

public record BookingExpiredEvent(
        Long bookingId,
        Long userId,
        Long slotId,
        Long venueId

) {
}
