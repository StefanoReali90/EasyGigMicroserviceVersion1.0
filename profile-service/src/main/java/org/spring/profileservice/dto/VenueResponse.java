package org.spring.profileservice.dto;

import org.spring.profileservice.utility.VenueType;

import java.util.List;

public record VenueResponse(
        Long id,
        String name,
        String phone,
        Integer capacity,
        VenueType type,
        String equipment,
        String directorName,
        String fullAddress,
        String cityName,
        List<PhotoResponse> photos
) {
}
