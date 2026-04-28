package org.spring.chatservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.spring.chatservice.dto.BookingAcceptedEvent;
import org.spring.chatservice.entity.ChatMessage;
import org.spring.chatservice.repository.ChatMessageRepository;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingEventConsumer {

    private final ChatMessageRepository chatMessageRepository;

    @KafkaListener(topics = "booking-accepted", groupId = "chat-service-group")
    public void consumeBookingAccepted(BookingAcceptedEvent event){
        log.info("Ricevuto evento di prenotazione accettata: {}", event);

        ChatMessage chatMessage = ChatMessage.builder()
                .bookingId(event.bookingId().toString())
                .senderId("system")
                .recipientId(event.musicianId().toString())
                .content("La tua prenotazione è stata accettata!")
                .timestamp(LocalDateTime.now())
                .build();
        chatMessageRepository.save(chatMessage);
        log.info("Chat inizializzata per la prenotazione: {}", event.bookingId());
    }
}
