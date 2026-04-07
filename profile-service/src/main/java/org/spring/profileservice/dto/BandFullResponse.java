package org.spring.profileservice.dto;

import java.util.List;

public record BandFullResponse(
        Long id,
        String name,
        Integer cachet,
        boolean negotiable,
        String bandType,
        String cityName,
        String linkStreaming,
        String filePath,
        String imagePath,
        List<Long> memberIds,
        List<String> genres
) {
}
