package org.spring.chatservice.repository;

import org.spring.chatservice.entity.ChatMessage;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ChatMessageRepository extends MongoRepository<ChatMessage, String> {
    List<ChatMessage> findByBookingIdOrderByTimestampAsc(String bookingId);
}
