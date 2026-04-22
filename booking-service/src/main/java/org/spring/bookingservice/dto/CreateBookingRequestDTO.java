package org.spring.bookingservice.dto;

public record CreateBookingRequestDTO(
        Long userId,
        Long slotId
) {
}
