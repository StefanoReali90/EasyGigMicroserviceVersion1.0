package org.spring.profileservice.dto;

public record PhotoRequest(
        Long id,
        String source,
        boolean isPrimary
) {
}
