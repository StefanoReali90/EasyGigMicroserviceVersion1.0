package org.spring.notificationservice.dto;

public record BookingExpiredEvent(
        Long bookingId,
        Long userId,
        Long slotId,
        Long venueId
) {}