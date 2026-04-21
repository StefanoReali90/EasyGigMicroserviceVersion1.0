package org.spring.bookingservice.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.spring.bookingservice.dto.BookingResponse;
import org.spring.bookingservice.entity.BookingRequest;

@Mapper(componentModel = "spring")
public interface BookingMapper {

    @Mapping(source = "id", target = "bookingId")
    @Mapping(source = "slot.id", target = "slotId")
    BookingResponse toBookingResponse(BookingRequest bookingRequest);
}
