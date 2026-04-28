package org.spring.bookingservice.dto;

public record BookingAcceptedEvent(
        Long bookingId,
        Long musicianId,
        Long venueId
) {}