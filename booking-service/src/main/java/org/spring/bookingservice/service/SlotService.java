package org.spring.bookingservice.service;

import lombok.Locked;
import lombok.RequiredArgsConstructor;
import org.spring.bookingservice.dto.CalendarResponseDTO;
import org.spring.bookingservice.dto.CreateSlotRequestDTO;
import org.spring.bookingservice.dto.SlotResponseDTO;
import org.spring.bookingservice.entity.Slot;
import org.spring.bookingservice.mapper.SlotMapper;
import org.spring.bookingservice.repository.SlotRepository;
import org.spring.bookingservice.utility.SlotState;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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

    public CalendarResponseDTO getCalendarAvailability(Long venueId, int month, int year) {

        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDateTime startOfMonth = yearMonth.atDay(1).atStartOfDay();
        LocalDateTime endOfMonth = yearMonth.atEndOfMonth().atTime(23, 59, 59);

        List<Slot> monthSlots = slotRepository.findByVenueIdAndStartBetween(venueId, startOfMonth, endOfMonth);

        Map<LocalDate, String> calendarColors = new HashMap<>();
        for (Slot slot : monthSlots) {
            LocalDate date = slot.getStart().toLocalDate();
            if ("green".equals(calendarColors.get(date))) {
                continue;
            }


            if (slot.getState() == SlotState.AVAILABLE) {
                calendarColors.put(date, "green");
            } else if (slot.getState() == SlotState.PENDING) {
                calendarColors.put(date, "yellow");
            } else if (slot.getState() == SlotState.BOOKED) {
                calendarColors.putIfAbsent(date, "red");
            }
        }
        return new CalendarResponseDTO(venueId, month, year, calendarColors);
    }
}
