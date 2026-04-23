package org.spring.profileservice.service;

import lombok.RequiredArgsConstructor;
import org.spring.profileservice.dto.BookingExpiredEvent;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class BookingEventConsumer {
    private final UserService userService;
    @KafkaListener(topics = "booking-expired-topic", groupId = "profile-group")
    public void consumeBookingExpired(BookingExpiredEvent event) {
        System.out.println("Strike assegnato al locale ID: " + event.venueId());
        userService.addStrikes(event.venueId());
    }

    @KafkaListener(topics = "booking-canceled-topic", groupId = "profile-group")
    public void consumeBookingCanceled(org.spring.profileservice.dto.BookingCanceledEvent event) {
        if ("VENUE".equals(event.canceledBy())) {
            System.out.println("Cancellazione da parte del locale ID: " + event.venueId() + ". Strike assegnato.");
            userService.addStrikes(event.venueId());
        } else {
            System.out.println("Cancellazione da parte dell'utente ID: " + event.userId() + ". Nessuno strike assegnato.");
        }
    }
}