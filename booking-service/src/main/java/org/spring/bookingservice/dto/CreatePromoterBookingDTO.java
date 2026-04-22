package org.spring.bookingservice.dto;

import java.util.List;

public record CreatePromoterBookingDTO(
        Long promoterId,
        Long venueId,
        List<Long> slotIds,
        List<Long> bandIds
) {
}
