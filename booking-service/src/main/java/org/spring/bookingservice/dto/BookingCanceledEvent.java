package org.spring.bookingservice.dto;

public record BookingCanceledEvent(
        Long id,
        Long userId,
        Long slotId,
        Long venueId,
        String canceledBy,
        String cancellationReason
) {
}
