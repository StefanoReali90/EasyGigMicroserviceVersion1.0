package org.spring.bookingservice.service;

import lombok.Locked;
import lombok.RequiredArgsConstructor;
import org.spring.bookingservice.dto.CreateSlotRequestDTO;
import org.spring.bookingservice.dto.SlotResponseDTO;
import org.spring.bookingservice.entity.Slot;
import org.spring.bookingservice.mapper.SlotMapper;
import org.spring.bookingservice.repository.SlotRepository;
import org.spring.bookingservice.utility.SlotState;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class SlotService {

    private final SlotRepository slotRepository;
    private final SlotMapper slotMapper;

    public SlotResponseDTO createSlot(CreateSlotRequestDTO requestDTO) {
        Long venueId = requestDTO.venueId();
        LocalDateTime start = requestDTO.start();
        LocalDateTime end = requestDTO.end();

        Slot slot = new Slot();
        slot.setVenueId(venueId);
        slot.setStart(start);
        slot.setEnd(end);
        slot.setState(SlotState.AVAILABLE);

        slotRepository.save(slot);

        return slotMapper.toSlotResponseDTO(slot);
    }
}
