package org.spring.profileservice.dto;

import java.util.List;

public record BandSearchResponse(
        Long id,
        String name,
        String description,
        Integer cachet,
        boolean negotiable,
        String bandType,
        String cityName,
        Long cityId,
        String primaryGenre,
        List<Long> genreIds,
        String profilePhoto,
        List<PhotoResponse> photos

) {
}
