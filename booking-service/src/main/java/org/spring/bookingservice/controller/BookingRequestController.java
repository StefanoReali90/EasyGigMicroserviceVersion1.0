package org.spring.bookingservice.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.spring.bookingservice.dto.BookingRequestDTO;
import org.spring.bookingservice.dto.BookingResponse;
import org.spring.bookingservice.dto.CancelBookingRequestDTO;
import org.spring.bookingservice.dto.CreatePromoterBookingDTO;
import org.spring.bookingservice.service.BookingRequestService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/bookings")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
@Tag(name = "Booking Management", description = "API per la gestione delle richieste di prenotazione tra Artisti, Venue e Promoter")
public class BookingRequestController {

    private final BookingRequestService bookingRequestService;

    @PostMapping
    @Operation(summary = "Crea una richiesta di prenotazione", description = "Un artista può richiedere di suonare in uno slot specifico di una venue.")
    public ResponseEntity<BookingResponse> createBookingRequest(
            @RequestHeader("X-User-Id") Long userId,
            @RequestBody BookingRequestDTO requestDTO) {
        BookingResponse response = bookingRequestService.createRequest(new BookingRequestDTO(userId, requestDTO.slotId()));
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/promoter")
    @Operation(summary = "Crea prenotazioni multiple (Promoter)", description = "Un promoter può bloccare più slot per diverse band contemporaneamente.")
    public ResponseEntity<List<BookingResponse>> createPromoterBooking(
            @RequestBody CreatePromoterBookingDTO dto) {
        List<BookingResponse> response = bookingRequestService.createPromoterBooking(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PatchMapping("/{bookingRequestId}/accept")
    @Operation(summary = "Accetta una richiesta", description = "La venue accetta la richiesta di un artista, confermando la prenotazione.")
    public ResponseEntity<BookingResponse> acceptRequest(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long bookingRequestId) {
        BookingResponse response = bookingRequestService.acceptRequest(userId, bookingRequestId);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{bookingRequestId}/reject")
    @Operation(summary = "Rifiuta una richiesta", description = "La venue rifiuta la richiesta di un artista.")
    public ResponseEntity<BookingResponse> rejectRequest(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long bookingRequestId) {
        BookingResponse response = bookingRequestService.rejectRequest(userId, bookingRequestId);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{bookingRequestId}/cancel-user")
    @Operation(summary = "Cancella prenotazione (Utente)", description = "L'utente (Artista/Promoter) annulla una prenotazione confermata o in sospeso.")
    public ResponseEntity<BookingResponse> cancelRequestByUser(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long bookingRequestId,
            @RequestBody CancelBookingRequestDTO cancelDTO) {
        BookingResponse response = bookingRequestService.cancelRequestByUser(userId, bookingRequestId, cancelDTO.reason());
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{bookingRequestId}/cancel-venue")
    @Operation(summary = "Cancella prenotazione (Venue)", description = "La venue annulla una prenotazione confermata o in sospeso.")
    public ResponseEntity<BookingResponse> cancelRequestByVenue(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long bookingRequestId,
            @RequestBody CancelBookingRequestDTO cancelDTO) {
        BookingResponse response = bookingRequestService.cancelRequestByVenue(userId, bookingRequestId, cancelDTO.reason());
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{bookingRequestId}/assign-band")
    @Operation(summary = "Assegna band a slot", description = "Il promoter assegna una band specifica a uno slot già bloccato.")
    public ResponseEntity<BookingResponse> assignBandToSlot(
            @PathVariable Long bookingRequestId,
            @RequestBody org.spring.bookingservice.dto.AssignBandToSlotDTO dto) {
        BookingResponse response = bookingRequestService.assignBandToSlot(bookingRequestId, dto);
        return ResponseEntity.ok(response);
    }
}