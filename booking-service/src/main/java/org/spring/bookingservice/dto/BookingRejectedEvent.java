package org.spring.bookingservice.dto;

public record BookingRejectedEvent(
    Long bookingId,
    Long artistId,
    Long venueId
) {}
