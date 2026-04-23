package org.spring.profileservice.dto;

import org.spring.profileservice.utility.OrganizationType;

import java.util.List;

public record OrganizationResponse(
        Long id,
        String name,
        String cityName,
        String description,
        OrganizationType type,
        List<MemberSummaryResponse> promoters
) {
}
