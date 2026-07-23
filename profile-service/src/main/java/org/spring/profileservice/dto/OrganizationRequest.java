package org.spring.profileservice.dto;

import org.spring.profileservice.utility.OrganizationType;

public record OrganizationRequest(
        String name,
        String partitaIva,
        String description,
        OrganizationType type,
        Long cityId,
        Long promoterId
) {
}
