package org.spring.profileservice.service;

import lombok.RequiredArgsConstructor;
import org.spring.profileservice.dto.BookingCanceledEvent;
import org.spring.profileservice.dto.BookingExpiredEvent;
import org.spring.profileservice.repository.VenueRepository;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class BookingEventConsumer {
    private final UserService userService;
    private final VenueRepository venueRepository;

    @KafkaListener(topics = "booking-expired-topic", groupId = "profile-group")
    public void consumeBookingExpired(BookingExpiredEvent event) {
        venueRepository.findById(event.venueId()).ifPresent(venue -> {
            Long directorId = venue.getDirector().getId();
            System.out.println("Strike assegnato al direttore ID: " + directorId + " per scadenza locale: " + venue.getName());
            userService.addStrikes(directorId);
        });
    }

    @KafkaListener(topics = "booking-canceled-topic", groupId = "profile-group")
    public void consumeBookingCanceled(BookingCanceledEvent event) {
        if ("VENUE".equals(event.canceledBy())) {
            venueRepository.findById(event.venueId()).ifPresent(venue -> {
                Long directorId = venue.getDirector().getId();
                System.out.println("Cancellazione da parte del locale: " + venue.getName() + ". Strike assegnato al direttore ID: " + directorId);
                userService.addStrikes(directorId);
            });
        } else {
            System.out.println("Cancellazione da parte dell'utente ID: " + event.userId() + ". Nessuno strike assegnato.");
        }
    }
}