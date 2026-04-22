package org.spring.bookingservice.dto;

public record CancelBookingRequestDTO(
        Long userId,
        String reason
) {
}
