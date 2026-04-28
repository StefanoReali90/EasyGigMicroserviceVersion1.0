package org.spring.chatservice.controller;

import lombok.RequiredArgsConstructor;
import org.spring.chatservice.entity.ChatMessage;
import org.spring.chatservice.repository.ChatMessageRepository;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/chat")
@RequiredArgsConstructor
public class ChatMessageController {

    private final ChatMessageRepository chatMessageRepository;
    private final SimpMessagingTemplate simpMessagingTemplate;

    @GetMapping("/{bookingId}")
    public List<ChatMessage> getChatMessages(@PathVariable String bookingId) {
        return chatMessageRepository.findByBookingIdOrderByTimestampAsc(bookingId);
    }

    @MessageMapping("/chat/{bookingId}")
    public void processMessage(@DestinationVariable String bookingId, @Payload ChatMessage chatMessage) {
        chatMessage.setTimestamp(LocalDateTime.now());
        chatMessage.setBookingId(bookingId);
        chatMessageRepository.save(chatMessage);
        simpMessagingTemplate.convertAndSend("/topic/messages" + bookingId, chatMessage);
    }
}

