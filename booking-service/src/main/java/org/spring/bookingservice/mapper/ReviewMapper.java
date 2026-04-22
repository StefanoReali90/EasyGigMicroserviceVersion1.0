package org.spring.bookingservice.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.spring.bookingservice.dto.ReviewResponseDTO;
import org.spring.bookingservice.entity.Review;

@Mapper(componentModel = "spring")
public interface ReviewMapper {
    @Mapping(source = "bookingRequest.id", target = "bookingRequestId")
    ReviewResponseDTO toReviewResponseDTO(Review review);
}
