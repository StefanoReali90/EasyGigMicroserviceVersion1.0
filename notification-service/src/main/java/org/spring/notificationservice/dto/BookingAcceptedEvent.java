package org.spring.notificationservice.dto;

public record BookingAcceptedEvent(
    Long bookingId,
    Long artistId,
    Long venueId
) {}
