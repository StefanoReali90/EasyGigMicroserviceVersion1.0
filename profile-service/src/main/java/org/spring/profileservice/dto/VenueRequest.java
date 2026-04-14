package org.spring.profileservice.dto;

import org.spring.profileservice.utility.VenueType;

public record VenueRequest(
        String name,
        String phone,
        Integer capacity,
        VenueType type,
        String equipment,
        Long directorId,
        String street,
        String houseNumber,
        String zipCode,
        Long cityId
) {
}
