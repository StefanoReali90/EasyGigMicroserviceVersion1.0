package org.spring.profileservice.dto;

public record ReviewCreatedEvent(
        Long reviewedId,
        int rate
) {}