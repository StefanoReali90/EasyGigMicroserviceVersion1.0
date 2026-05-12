package org.spring.bookingservice.dto;

public record ReviewCreatedEvent(
        Long reviewedId,
        int rate,
        String role
) {}