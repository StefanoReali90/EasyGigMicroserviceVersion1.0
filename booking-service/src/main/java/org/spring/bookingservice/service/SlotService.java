package org.spring.bookingservice.service;

import lombok.Locked;
import lombok.RequiredArgsConstructor;
import org.spring.bookingservice.dto.AvailableVenuesResponseDTO;
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
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class SlotService {

    private final SlotRepository slotRepository;
    private final SlotMapper slotMapper;

    public SlotResponseDTO createSlot(CreateSlotRequestDTO requestDTO, Long directorId) {
        Long venueId = requestDTO.venueId();
        LocalDateTime start = requestDTO.start();
        LocalDateTime end = requestDTO.end();

        if (start == null || end == null || !end.isAfter(start)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "L'ora di fine dello slot deve essere successiva all'ora di inizio.");
        }

        List<Slot> overlapping = slotRepository.findOverlappingSlots(venueId, start, end);
        if (!overlapping.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Esiste già uno slot che si sovrappone a questo orario per il locale selezionato.");
        }

        Slot slot = new Slot();
        slot.setVenueId(venueId);
        slot.setDirectorId(directorId);
        slot.setStart(start);
        slot.setEnd(end);
        slot.setState(SlotState.AVAILABLE);

        slotRepository.save(slot);

        return slotMapper.toSlotResponseDTO(slot);
    }

    public CalendarResponseDTO getCalendarAvailability(Long venueId, int month, int year) {

        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDateTime startOfMonth = yearMonth.atDay(1).atStartOfDay().minusDays(10);
        LocalDateTime endOfMonth = yearMonth.atEndOfMonth().atTime(23, 59, 59).plusDays(10);

        List<Slot> monthSlots = slotRepository.findByVenueIdAndStartBetween(venueId, startOfMonth, endOfMonth);

        Map<String, String> calendarColors = new HashMap<>();
        for (Slot slot : monthSlots) {
            String dateStr = slot.getStart().toLocalDate().toString();
            if ("green".equals(calendarColors.get(dateStr))) {
                continue;
            }

            if (slot.getState() == SlotState.AVAILABLE) {
                calendarColors.put(dateStr, "green");
            } else if (slot.getState() == SlotState.PENDING) {
                calendarColors.put(dateStr, "yellow");
            } else if (slot.getState() == SlotState.BOOKED) {
                calendarColors.putIfAbsent(dateStr, "red");
            }
        }
        return new CalendarResponseDTO(venueId, month, year, calendarColors);
    }

    public AvailableVenuesResponseDTO getAvailableVenues(List<Long> venueIds, LocalDate date) {
        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = date.atTime(23, 59, 59);

        List<Slot> availableSlots = slotRepository.findByVenueIdInAndStartBetweenAndState(venueIds, start, end, SlotState.AVAILABLE);
        List<Long> ids = availableSlots.stream()
                .map(Slot::getVenueId)
                .distinct()
                .toList();
        return new AvailableVenuesResponseDTO(ids);
    }

    public List<SlotResponseDTO> getSlotsByVenueAndDate(Long venueId, LocalDate date) {
        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = date.atTime(23, 59, 59);
        return slotRepository.findByVenueIdAndStartBetween(venueId, start, end).stream()
                .map(slotMapper::toSlotResponseDTO)
                .toList();
    }

    public List<SlotResponseDTO> getSlotsByVenue(Long venueId) {
        return slotRepository.findByVenueId(venueId).stream()
                .map(slotMapper::toSlotResponseDTO)
                .toList();
    }

    public void deleteSlot(Long slotId) {
        slotRepository.deleteById(slotId);
    }
}
