package org.spring.notificationservice.service;

import lombok.RequiredArgsConstructor;
import org.spring.notificationservice.dto.BookingCanceledEvent;
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

    @KafkaListener(topics = "booking-canceled-topic", groupId = "notification-group")
    public void consumeBookingCanceled(BookingCanceledEvent event){
        System.out.println("Ricevuto evento di cancellazione prenotazione: " + event);
        System.out.println("Prenotazione ID: "+ event.id());
        System.out.println("Cancellato da: " + event.canceledBy());
        System.out.println("Motivazione: " + event.cancellationReason());

        try{
            String subject = "Prenotazione cancellata da " + event.canceledBy();
            String body = "La prenotazione è stata annullata. Motivazione: " + event.cancellationReason();

            emailService.sendEmail("test@easygig.com", subject, body);
            System.out.println("Email di disdetta inviata con successo a test@easygig.com");
        }catch (Exception e){
            System.err.println("Errore nell'invio della mail: "+ e.getMessage());
        }
    }
}
