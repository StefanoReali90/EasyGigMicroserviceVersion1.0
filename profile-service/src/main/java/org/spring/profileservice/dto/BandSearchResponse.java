package org.spring.profileservice.dto;

import java.util.List;

public record BandSearchResponse(
        Long id,
        String name,
        Integer cachet,
        boolean negotiable,
        String bandType,
        String cityName,
        String primaryGenre,
        List<PhotoResponse> photos

) {
}
