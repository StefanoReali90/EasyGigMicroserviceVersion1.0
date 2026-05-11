package org.spring.notificationservice.dto;

public record BookingRequestCreatedEvent(
    Long bookingId,
    Long artistId,
    Long venueId,
    String slotStart
) {}
