package org.spring.profileservice.dto;

public record MemberSummaryResponse(
        Long id,
        String firstName,
        String lastName,
        String role
) {
}
