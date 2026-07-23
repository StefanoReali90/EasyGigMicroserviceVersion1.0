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
        boolean isConfirmedBooking = "ACCEPTED".equals(event.previousStatus());
        
        if ("VENUE".equals(event.canceledBy())) {
            // Un locale riceve uno strike solo se cancella un booking già accettato
            if (isConfirmedBooking) {
                venueRepository.findById(event.venueId()).ifPresent(venue -> {
                    Long directorId = venue.getDirector().getId();
                    System.out.println("[STRIKE] Cancellazione di evento CONFERMATO da parte del locale: " + venue.getName() + ". Strike al direttore ID: " + directorId);
                    userService.addStrikes(directorId);
                });
            } else {
                System.out.println("[INFO] Cancellazione di richiesta pendente da parte del locale. Nessuno strike.");
            }
        } else if ("USER".equals(event.canceledBy())) {
            // Un artista riceve uno strike solo se cancella un booking accettato a meno di 48h (Late Cancellation)
            if (isConfirmedBooking && event.isLateCancellation()) {
                System.out.println("[STRIKE] Late Cancellation di evento CONFERMATO da parte dell'artista ID: " + event.userId() + ". Strike assegnato.");
                userService.addStrikes(event.userId());
            } else {
                String reason = !isConfirmedBooking ? "richiesta non ancora confermata" : "cancellazione entro i termini (48h)";
                System.out.println("[INFO] Cancellazione artista senza strike: " + reason);
            }
        }
    }
}