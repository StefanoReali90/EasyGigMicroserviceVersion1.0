package org.spring.bookingservice.dto;

import java.time.LocalDateTime;

public record ReviewResponseDTO(
        Long id,
        Long reviewerId,
        Long reviewedId,
        int rate,
        String comment,
        String role,
        LocalDateTime createdAt,
        Long bookingRequestId
) {}
