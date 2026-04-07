package org.spring.profileservice.dto;

import org.spring.profileservice.utility.BandType;

import java.util.List;

public record BandRegistrationRequest(
        String name,
        Integer cachet,
        boolean negotiable,
        BandType bandType,
        Long cityId,
        String linkStreaming,
        List<Long> memberIds,
        List<Long> genreIds

) {
}
