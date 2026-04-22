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
}