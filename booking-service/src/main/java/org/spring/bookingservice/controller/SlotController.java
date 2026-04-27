package org.spring.bookingservice.controller;

import lombok.RequiredArgsConstructor;
import org.spring.bookingservice.dto.AvailableVenuesResponseDTO;
import org.spring.bookingservice.dto.CalendarResponseDTO;
import org.spring.bookingservice.dto.CreateSlotRequestDTO;
import org.spring.bookingservice.dto.SlotResponseDTO;
import org.spring.bookingservice.service.SlotService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping(path= "/slots")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class SlotController {

    private final SlotService slotService;

    @PostMapping
    public ResponseEntity<SlotResponseDTO> createSlot(@RequestBody CreateSlotRequestDTO requestDTO) {
        SlotResponseDTO response = slotService.createSlot(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping(value = "/calendar/{venueId}")
    public ResponseEntity<CalendarResponseDTO> getCalendar(
            @PathVariable Long venueId,
            @RequestParam int month,
            @RequestParam int year) {
        
        CalendarResponseDTO response = slotService.getCalendarAvailability(venueId, month, year);
        return ResponseEntity.ok(response);
    }

    @GetMapping(value = "/available-venues")
    public ResponseEntity<AvailableVenuesResponseDTO> getAvailableVenues(
            @RequestParam List<Long> venueIds,
        @RequestParam LocalDate date){

        AvailableVenuesResponseDTO response = slotService.getAvailableVenues(venueIds, date);
        return ResponseEntity.ok(response);
    }

}
