package org.spring.notificationservice.service;

import lombok.RequiredArgsConstructor;
import org.spring.notificationservice.dto.InvitationEventDTO;
import org.spring.notificationservice.entity.NotificationLog;
import org.spring.notificationservice.exception.EmailSendingException;
import org.spring.notificationservice.repository.NotificationLogRepository;
import org.spring.notificationservice.utility.NotificationStatus;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class NotificationConsumer {

    private final EmailService emailService;

    private final NotificationLogRepository notificationLogRepository;

    @KafkaListener(topics = "invitation-topic", groupId = "notification-group")
    public void consume(InvitationEventDTO event) {
        NotificationLog log = new NotificationLog();
        log.setEmail(event.email());
        log.setSendDate(LocalDate.now());
        log.setStatus(NotificationStatus.PENDING);

        log = notificationLogRepository.save(log);

        try {


            emailService.sendInvitationEmail(
                    event.email(),
                    event.groupName(),
                    event.memberCount(),
                    event.token(),
                    7
            );
            log.setStatus(NotificationStatus.SENT);

        } catch (Exception e) {
            log.setStatus(NotificationStatus.FAILED);
            throw new EmailSendingException("Impossibile inviare la mail a " + event.email(), e);
        } finally {
            notificationLogRepository.save(log);
        }
    }
}
