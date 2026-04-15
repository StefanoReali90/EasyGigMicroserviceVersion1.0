package org.spring.profileservice.dto;

public record PhotoResponse(
        Long id,
        String source,
        boolean isPrimary
) {
}
