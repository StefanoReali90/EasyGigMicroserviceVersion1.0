package org.spring.profileservice.dto;

import java.util.List;

public record BandResponse(
        Long id,
        String name,
        Integer cachet,
        boolean negotiable,
        String bandType,
        String cityName,
        String linkStreaming,
        List<Long> memberIds,
        List<String> genreNames
) {
}
