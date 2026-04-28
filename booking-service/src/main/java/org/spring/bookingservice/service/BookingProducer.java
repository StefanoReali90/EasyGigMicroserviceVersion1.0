package org.spring.bookingservice.service;

import org.spring.bookingservice.dto.BookingAcceptedEvent;
import org.spring.bookingservice.dto.BookingCanceledEvent;
import org.spring.bookingservice.dto.BookingExpiredEvent;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class BookingProducer {

    private final KafkaTemplate<String,Object> kafkaTemplate;
    private final String TOPIC = "booking-expired-topic";

    public BookingProducer(KafkaTemplate<String,Object> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void sendStrikeEvent(BookingExpiredEvent event) {
        kafkaTemplate.send(TOPIC, event);
    }

    public void sendCanceledEvent(BookingCanceledEvent event) {
        kafkaTemplate.send("booking-canceled-topic", event);
    }
    public void sendReviewEvent(org.spring.bookingservice.dto.ReviewCreatedEvent event) {
        kafkaTemplate.send("review-created-topic", event);
    }
    public void sendAcceptedEvent(BookingAcceptedEvent event){
        kafkaTemplate.send("booking-accepted", event);
    }

}
