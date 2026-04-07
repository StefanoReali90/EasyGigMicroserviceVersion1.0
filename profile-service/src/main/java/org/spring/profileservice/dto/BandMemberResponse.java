package org.spring.profileservice.dto;

public record BandMemberResponse(
        Long id,
        String firstName,
        String lastName
) {
}