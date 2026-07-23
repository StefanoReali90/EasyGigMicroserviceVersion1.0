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
public class SlotController {

    private final SlotService slotService;

    @PostMapping
    public ResponseEntity<SlotResponseDTO> createSlot(
            @RequestHeader("X-User-Id") Long userId,
            @RequestBody CreateSlotRequestDTO requestDTO) {
        SlotResponseDTO response = slotService.createSlot(requestDTO, userId);
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

    @GetMapping(value = "/venue/{venueId}/date/{date}")
    public ResponseEntity<List<SlotResponseDTO>> getSlotsByVenueAndDate(
            @PathVariable Long venueId,
            @PathVariable LocalDate date) {
        return ResponseEntity.ok(slotService.getSlotsByVenueAndDate(venueId, date));
    }

    @GetMapping(value = "/venue/{venueId}")
    public ResponseEntity<List<SlotResponseDTO>> getSlotsByVenue(@PathVariable Long venueId) {
        return ResponseEntity.ok(slotService.getSlotsByVenue(venueId));
    }

    @DeleteMapping("/{slotId}")
    public ResponseEntity<Void> deleteSlot(@PathVariable Long slotId) {
        slotService.deleteSlot(slotId);
        return ResponseEntity.noContent().build();
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleIllegalArgumentException(IllegalArgumentException e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
    }
}
