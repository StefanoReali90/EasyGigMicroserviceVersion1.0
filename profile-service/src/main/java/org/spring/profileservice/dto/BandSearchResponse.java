package org.spring.profileservice.dto;

public record BandSearchResponse(
        Long id,
        String name,
        Integer cachet,
        boolean negotiable,
        String bandType,
        String cityName,
        String imagePath,
        String primaryGenre

) {
}
