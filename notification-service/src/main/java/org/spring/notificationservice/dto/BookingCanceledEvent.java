package org.spring.notificationservice.dto;

public record BookingCanceledEvent(
        Long id,
        Long userId,
        Long slotId,
        Long venueId,
        String canceledBy,
        String cancellationReason
) {
}
