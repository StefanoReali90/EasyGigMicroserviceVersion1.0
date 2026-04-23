package org.spring.profileservice.dto;

public record TrackResponse(
        Long id,
        String title,
        String url,
        boolean isExternal
) {
}
