package org.spring.bookingservice.service;

import lombok.RequiredArgsConstructor;
import org.spring.bookingservice.dto.CreateReviewDTO;
import org.spring.bookingservice.dto.ReviewCreatedEvent;
import org.spring.bookingservice.dto.ReviewResponseDTO;
import org.spring.bookingservice.entity.BookingRequest;
import org.spring.bookingservice.entity.Event;
import org.spring.bookingservice.entity.Review;
import org.spring.bookingservice.exception.ReviewNotAllowedException;
import org.spring.bookingservice.mapper.ReviewMapper;
import org.spring.bookingservice.repository.BookingRequestRepository;
import org.spring.bookingservice.repository.ReviewRepository;
import org.spring.bookingservice.utility.BookingSlotState;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final BookingRequestRepository bookingRequestRepository;
    private final ReviewMapper reviewMapper;
    private final BookingProducer bookingProducer;

    public ReviewResponseDTO createReview(CreateReviewDTO createReviewDTO) {
        Long reviewedId = createReviewDTO.reviewedId();
        Long reviewerId = createReviewDTO.reviewerId();
        BookingRequest bookingRequest = bookingRequestRepository.findById(createReviewDTO.bookingRequestId())
                .orElseThrow(() -> new RuntimeException("Nessuna prenotazione trovata per questo utente e locale"));

        if (bookingRequest.getStatus() != BookingSlotState.ACCEPTED) {
            throw new RuntimeException("Puoi recensire solo prenotazioni accettate");
        }
        Event event = bookingRequest.getEvents().stream()
                .findFirst()
                .orElseThrow(() -> new ReviewNotAllowedException("Nessun evento trovato per questa prenotazione"));
        if (LocalDateTime.now().isBefore(event.getEndTime())) {
            throw new ReviewNotAllowedException("Non puoi recensire un evento che non è ancora terminato");
        }

        if (LocalDateTime.now().isAfter(event.getEndTime().plusDays(7))) {
            throw new ReviewNotAllowedException("Il periodo di recensione di 7 giorni è scaduto");
        }

        if (reviewRepository.existsByReviewerIdAndBookingRequestId(reviewerId, bookingRequest.getId())) {
            throw new ReviewNotAllowedException("Hai già lasciato una recensione per questa prenotazione");
        }

        if (createReviewDTO.rate() < 1 || createReviewDTO.rate() > 5) {
            throw new ReviewNotAllowedException("Il voto deve essere tra 1 e 5");
        }

        Review review = new Review();
        review.setReviewerId(reviewerId);
        review.setReviewedId(reviewedId);
        int rate = createReviewDTO.rate();
        review.setRate(rate);
        review.setCreatedAt(LocalDateTime.now());
        review.setBookingRequest(bookingRequest);
        review.setComment(createReviewDTO.comment());
        review.setRole(createReviewDTO.role());

        reviewRepository.save(review);
        ReviewCreatedEvent eventsend = new ReviewCreatedEvent(reviewedId, rate);
        bookingProducer.sendReviewEvent(eventsend);

        return reviewMapper.toReviewResponseDTO(review);


    }
}
