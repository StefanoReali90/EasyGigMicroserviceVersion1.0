package org.spring.bookingservice.dto;

public record CreateReviewDTO(
        Long reviewerId,
        Long reviewedId,
        Long bookingRequestId,
        int rate,
        String comment,
        String role

) {
}
