package org.spring.profileservice.service;

import lombok.RequiredArgsConstructor;
import org.spring.profileservice.dto.ReviewCreatedEvent;
import org.spring.profileservice.repository.VenueRepository;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ReviewEventConsumer {
    private final UserService userService;
    private final VenueRepository venueRepository;

    @KafkaListener(topics = "review-created-topic", groupId = "profile-group")
    public void consumeReviewCreated(ReviewCreatedEvent event) {
        if ("VENUE".equals(event.role())) {
            venueRepository.findById(event.reviewedId()).ifPresent(venue -> {
                Long directorId = venue.getDirector().getId();
                System.out.println("Recensione ricevuta per il locale: " + venue.getName() + ". Aggiorno reputazione del direttore ID: " + directorId);
                userService.updateReputation(directorId, event.rate());
            });
        } else {
            System.out.println("Recensione ricevuta per l'utente ID: " + event.reviewedId() + " (Voto: " + event.rate() + ")");
            userService.updateReputation(event.reviewedId(), event.rate());
        }
    }
}