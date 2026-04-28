package org.spring.chatservice.dto;

public record BookingAcceptedEvent(
        Long bookingId,
        Long musicianId,
        Long venueId
) {}