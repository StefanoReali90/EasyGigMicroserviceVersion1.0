package org.spring.bookingservice.controller;

import lombok.RequiredArgsConstructor;
import org.spring.bookingservice.dto.CreateReviewDTO;
import org.spring.bookingservice.dto.ReviewResponseDTO;
import org.spring.bookingservice.service.ReviewService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    /**
     * POST /reviews
     * Crea una nuova recensione per una prenotazione accettata.
     * Regole di business:
     * - La prenotazione deve essere in stato ACCEPTED
     * - La recensione deve essere lasciata entro 7 giorni dalla fine dell'evento
     * - Un utente può lasciare una sola recensione per prenotazione
     * - Il voto deve essere compreso tra 1 e 5
     */
    @PostMapping
    public ResponseEntity<ReviewResponseDTO> createReview(
            @RequestHeader("X-User-Id") Long userId,
            @RequestBody CreateReviewDTO createReviewDTO) {
        
        // Usiamo il userId dal token come reviewerId
        CreateReviewDTO updatedDTO = new CreateReviewDTO(
                userId, 
                createReviewDTO.reviewedId(), 
                createReviewDTO.bookingRequestId(), 
                createReviewDTO.rate(), 
                createReviewDTO.comment(), 
                createReviewDTO.role()
        );
        
        ReviewResponseDTO response = reviewService.createReview(updatedDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
