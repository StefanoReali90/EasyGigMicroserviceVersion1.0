package org.spring.bookingservice.mapper;

import org.mapstruct.Mapper;
import org.spring.bookingservice.dto.SlotResponseDTO;
import org.spring.bookingservice.entity.Slot;
import org.springframework.stereotype.Component;

@Mapper(componentModel = "spring")
public interface SlotMapper {

    SlotResponseDTO toSlotResponseDTO(Slot slot);
}
