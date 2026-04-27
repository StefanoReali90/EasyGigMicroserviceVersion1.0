package org.spring.notificationservice.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.spring.notificationservice.dto.BookingCanceledEvent;
import org.spring.notificationservice.dto.InvitationEventDTO;
import org.spring.notificationservice.entity.NotificationLog;
import org.spring.notificationservice.repository.NotificationLogRepository;
import org.spring.notificationservice.utility.GroupType;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationConsumerTest {

    @Mock
    private EmailService emailService;
    @Mock
    private NotificationLogRepository notificationLogRepository;

    @InjectMocks
    private NotificationConsumer notificationConsumer;

    @Test
    void consumeInvitation_Success() {
        // Arrange
        InvitationEventDTO event = new InvitationEventDTO(
                "test@example.com", "The Band", "token123", GroupType.BAND, 4
        );
        when(notificationLogRepository.save(any(NotificationLog.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        notificationConsumer.consume(event);

        // Assert
        verify(emailService, times(1)).sendInvitationEmail(
                eq("test@example.com"), eq("The Band"), eq(4), eq("token123"), anyInt()
        );
        verify(notificationLogRepository, atLeastOnce()).save(any(NotificationLog.class));
    }

    @Test
    void consumeBookingCanceled_Success() {
        // Arrange
        BookingCanceledEvent event = new BookingCanceledEvent(
                1L, 10L, 100L, 200L, "USER", "Change of plans"
        );

        // Act
        notificationConsumer.consumeBookingCanceled(event);

        // Assert
        verify(emailService, times(1)).sendEmail(
                anyString(), anyString(), contains("Change of plans")
        );
    }
}
