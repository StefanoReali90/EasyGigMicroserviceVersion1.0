package org.spring.chatservice.dto;

public record BookingAcceptedEvent(
        Long bookingId,
        Long userId,
        Long venueId
) {}