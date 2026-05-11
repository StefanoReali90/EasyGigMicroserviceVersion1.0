package org.spring.profileservice.dto;

import org.spring.profileservice.utility.UserType;

import java.util.List;

public record UserResponse(
        Long id,
        String email,
        String firstName,
        String lastName,
        UserType role,
        Double reputation,
        Integer reviewCount,
        Integer strikes,
        boolean isBanned,
        List<TrackResponse> tracks,
        List<BandResponse> bands
) {
}
