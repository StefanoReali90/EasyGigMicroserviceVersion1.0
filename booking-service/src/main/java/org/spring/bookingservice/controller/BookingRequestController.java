package org.spring.bookingservice.controller;

import lombok.RequiredArgsConstructor;
import org.spring.bookingservice.dto.BookingRequestDTO;
import org.spring.bookingservice.dto.BookingResponse;
import org.spring.bookingservice.dto.CancelBookingRequestDTO;
import org.spring.bookingservice.dto.CreateBookingRequestDTO;
import org.spring.bookingservice.service.BookingRequestService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/bookings")
@RequiredArgsConstructor
public class BookingRequestController {

    private final BookingRequestService bookingRequestService;

    /**
     * Crea una nuova prenotazione
     */
    @PostMapping
    public ResponseEntity<BookingResponse> createBookingRequest(@RequestBody BookingRequestDTO requestDTO) {
        BookingResponse response = bookingRequestService.createRequest(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Accetta una prenotazione
     */
    @PutMapping("/{bookingRequestId}/accept")
    public ResponseEntity<BookingResponse> acceptRequest(
            @PathVariable Long bookingRequestId,
            @RequestParam Long userId) { 
        BookingResponse response = bookingRequestService.acceptRequest(userId, bookingRequestId);
        return ResponseEntity.ok(response);
    }

    /**
     * Cancella una prenotazione lato UTENTE
     */
    @PutMapping("/{bookingRequestId}/cancel-user")
    public ResponseEntity<BookingResponse> cancelRequestByUser(
            @PathVariable Long bookingRequestId,
            @RequestBody CancelBookingRequestDTO cancelDTO) {
        BookingResponse response = bookingRequestService.cancelRequestByUser(cancelDTO.userId(), bookingRequestId, cancelDTO.reason());
        return ResponseEntity.ok(response);
    }

    /**
     * Cancella una prenotazione lato LOCALE (VENUE)
     */
    @PutMapping("/{bookingRequestId}/cancel-venue")
    public ResponseEntity<BookingResponse> cancelRequestByVenue(
            @PathVariable Long bookingRequestId,
            @RequestBody CancelBookingRequestDTO cancelDTO) {
        BookingResponse response = bookingRequestService.cancelRequestByVenue(cancelDTO.userId(), bookingRequestId, cancelDTO.reason());
        return ResponseEntity.ok(response);
    }
}