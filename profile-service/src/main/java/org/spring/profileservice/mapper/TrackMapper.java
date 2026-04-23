package org.spring.profileservice.mapper;

import org.mapstruct.Mapper;
import org.spring.profileservice.dto.TrackResponse;
import org.spring.profileservice.entity.MusicTrack;

import java.util.List;

@Mapper(componentModel = "spring")
public interface TrackMapper {
    TrackResponse toResponse(MusicTrack track);
    List<TrackResponse> toResponseList(List<MusicTrack> tracks);
}
