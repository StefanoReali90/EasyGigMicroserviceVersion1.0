package org.spring.bookingservice.dto;

public record BookingRequestDTO(
        Long userId,
        Long slotId
) {

}
