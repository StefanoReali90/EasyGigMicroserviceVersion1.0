package org.spring.bookingservice.service;

import lombok.RequiredArgsConstructor;
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

}
