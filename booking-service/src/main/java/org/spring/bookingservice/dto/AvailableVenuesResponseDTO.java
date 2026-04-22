package org.spring.bookingservice.dto;

import java.util.List;

public record AvailableVenuesResponseDTO(
        List<Long> availableVenuesIds
) {
}
