package org.spring.profileservice.dto;

import java.util.List;

public record BandFullResponse(
        Long id,
        String name,
        Integer cachet,
        boolean negotiable,
        String bandType,
        String cityName,
        List<TrackResponse> tracks,
        String imagePath,
        List<MemberSummaryResponse> member,
        List<String> genres,
        List<PhotoResponse> photos
) {
}
