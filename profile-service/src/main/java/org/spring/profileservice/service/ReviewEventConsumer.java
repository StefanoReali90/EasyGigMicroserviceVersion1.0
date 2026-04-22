package org.spring.profileservice.service;

import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ReviewEventConsumer {
    private final UserService userService;
    @KafkaListener(topics = "review-created-topic", groupId = "profile-group")
    public void consumeReviewCreated(org.spring.profileservice.dto.ReviewCreatedEvent event) {
        System.out.println(" Nuova recensione ricevuta per l'utente ID: " + event.reviewedId() + " (Voto: " + event.rate() + ")");
        userService.updateReputation(event.reviewedId(), event.rate());
    }
}