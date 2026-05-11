package org.spring.bookingservice.dto;

public record BookingRequestCreatedEvent(
    Long bookingId,
    Long artistId,
    Long venueId,
    String slotStart
) {}
