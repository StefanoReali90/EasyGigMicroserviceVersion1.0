package org.spring.profileservice.dto;

import java.util.List;

public record BandFullResponse(
        Long id,
        String name,
        String description,
        Integer cachet,
        boolean negotiable,
        String bandType,
        String cityName,
        List<TrackResponse> tracks,
        String profilePhoto,
        List<MemberSummaryResponse> member,
        List<String> genres,
        List<PhotoResponse> photos
) {
}
