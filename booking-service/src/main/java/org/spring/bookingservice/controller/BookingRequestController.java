package org.spring.bookingservice.controller;

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
public class BookingRequestController {

    private final BookingRequestService bookingRequestService;

    /**
     * POST /bookings
     * Crea una nuova prenotazione. Restituisce 201 Created.
     */
    @PostMapping
    public ResponseEntity<BookingResponse> createBookingRequest(@RequestBody BookingRequestDTO requestDTO) {
        BookingResponse response = bookingRequestService.createRequest(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/promoter")
    public ResponseEntity<List<BookingResponse>> createPromoterBooking(
            @RequestBody CreatePromoterBookingDTO dto) {
        List<BookingResponse> response = bookingRequestService.createPromoterBooking(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * PATCH /bookings/{id}/accept
     * Modifica parzialmente lo stato della prenotazione -> ACCEPTED.
     * userId nel body perché è identità dell'attore, non un filtro di ricerca.
     */
    @PatchMapping("/{bookingRequestId}/accept")
    public ResponseEntity<BookingResponse> acceptRequest(
            @PathVariable Long bookingRequestId,
            @RequestBody CancelBookingRequestDTO acceptDTO) {
        BookingResponse response = bookingRequestService.acceptRequest(acceptDTO.userId(), bookingRequestId);
        return ResponseEntity.ok(response);
    }

    /**
     * PATCH /bookings/{id}/reject
     * Modifica parzialmente lo stato della prenotazione -> REJECTED.
     * Non richiede motivazione per requisito di business.
     */
    @PatchMapping("/{bookingRequestId}/reject")
    public ResponseEntity<BookingResponse> rejectRequest(
            @PathVariable Long bookingRequestId,
            @RequestBody CancelBookingRequestDTO rejectDTO) {
        BookingResponse response = bookingRequestService.rejectRequest(rejectDTO.userId(), bookingRequestId);
        return ResponseEntity.ok(response);
    }

    /**
     * PATCH /bookings/{id}/cancel-user
     * Cancellazione da parte dell'utente. Motivazione obbligatoria.
     */
    @PatchMapping("/{bookingRequestId}/cancel-user")
    public ResponseEntity<BookingResponse> cancelRequestByUser(
            @PathVariable Long bookingRequestId,
            @RequestBody CancelBookingRequestDTO cancelDTO) {
        BookingResponse response = bookingRequestService.cancelRequestByUser(cancelDTO.userId(), bookingRequestId, cancelDTO.reason());
        return ResponseEntity.ok(response);
    }

    /**
     * PATCH /bookings/{id}/cancel-venue
     * Cancellazione da parte del locale. Motivazione obbligatoria.
     */
    @PatchMapping("/{bookingRequestId}/cancel-venue")
    public ResponseEntity<BookingResponse> cancelRequestByVenue(
            @PathVariable Long bookingRequestId,
            @RequestBody CancelBookingRequestDTO cancelDTO) {
        BookingResponse response = bookingRequestService.cancelRequestByVenue(cancelDTO.userId(), bookingRequestId, cancelDTO.reason());
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{bookingRequestId}/assign-band")
    public ResponseEntity<BookingResponse> assignBandToSlot(
            @PathVariable Long bookingRequestId,
            @RequestBody org.spring.bookingservice.dto.AssignBandToSlotDTO dto) {
        BookingResponse response = bookingRequestService.assignBandToSlot(bookingRequestId, dto);
        return ResponseEntity.ok(response);
    }
}