package org.spring.notificationservice.dto;

public record BookingRejectedEvent(
    Long bookingId,
    Long artistId,
    Long venueId
) {}
