package org.spring.notificationservice.service;

import lombok.RequiredArgsConstructor;
import org.spring.notificationservice.dto.*;
import org.spring.notificationservice.entity.Notification;
import org.spring.notificationservice.entity.NotificationLog;
import org.spring.notificationservice.exception.EmailSendingException;
import org.spring.notificationservice.repository.NotificationLogRepository;
import org.spring.notificationservice.repository.NotificationRepository;
import org.spring.notificationservice.utility.NotificationStatus;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

/**
 * Consumatore di eventi Kafka per il sistema di notifiche.
 * Centralizza la logica di invio email a seguito di eventi di sistema (inviti, cancellazioni, errori).
 */
@Service
@RequiredArgsConstructor
public class NotificationConsumer {

    private final EmailService emailService;

    private final NotificationLogRepository notificationLogRepository;
    private final NotificationRepository notificationRepository;

    private void saveInAppNotification(Long userId, String title, String message, String type) {
        Notification notification = Notification.builder()
                .userId(userId)
                .title(title)
                .message(message)
                .type(type)
                .timestamp(java.time.LocalDateTime.now())
                .build();
        notificationRepository.save(notification);
    }

    /**
     * Gestisce la ricezione di nuovi inviti e l'invio della relativa mail transazionale.
     * Registra l'esito dell'operazione nel database per scopi di auditing.
     */
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
        try{
            String subject = "Prenotazione cancellata da " + event.canceledBy();
            String body = "La prenotazione #" + event.id() + " è stata annullata. Motivazione: " + event.cancellationReason();

            emailService.sendEmail("test@easygig.com", subject, body);
            
            // In-App
            saveInAppNotification(event.userId(), "Prenotazione Cancellata", body, "BOOKING");

        }catch (Exception e){
            System.err.println("Errore nell'invio della mail: "+ e.getMessage());
        }
    }

    @KafkaListener(topics = "booking-expired-topic", groupId = "notification-group")
    public void consumeBookingExpired(BookingExpiredEvent event) {
        String subject = "Prenotazione scaduta - Strike ricevuto";
        String body = "Non hai risposto alla prenotazione #" + event.bookingId() +
                " entro 5 giorni. Ti è stato assegnato uno strike.";
        emailService.sendEmail("test@easygig.com", subject, body);
        
        saveInAppNotification(event.userId(), "Strike Ricevuto", body, "STRIKE");
    }

    @KafkaListener(topics = "booking-created-topic", groupId = "notification-group")
    public void consumeBookingCreated(org.spring.notificationservice.dto.BookingRequestCreatedEvent event) {
        String subject = "Nuova richiesta di prenotazione ricevuta!";
        String body = "L'artista ID: " + event.artistId() + " ha richiesto uno slot per il giorno " + event.slotStart() + ". Accedi alla dashboard per rispondere.";
        emailService.sendEmail("easygigapp1.0@gmail.com", subject, body);

        // In produzione: recuperare l'ID del direttore del locale tramite profile-service
        saveInAppNotification(event.venueId(), "Nuova Richiesta", body, "BOOKING");
    }

    @KafkaListener(topics = "booking-accepted", groupId = "notification-group")
    public void consumeBookingAccepted(org.spring.notificationservice.dto.BookingAcceptedEvent event) {
        String subject = "Grande notizia! La tua serata è stata confermata!";
        String body = "Il locale ID: " + event.venueId() + " ha accettato la tua richiesta per la prenotazione #" + event.bookingId() + ". Controlla i tuoi messaggi per i dettagli.";
        emailService.sendEmail("easygigapp1.0@gmail.com", subject, body);

        saveInAppNotification(event.artistId(), "Serata Confermata!", body, "BOOKING");
    }

    @KafkaListener(topics = "booking-rejected-topic", groupId = "notification-group")
    public void consumeBookingRejected(org.spring.notificationservice.dto.BookingRejectedEvent event) {
        String subject = "Aggiornamento sulla tua richiesta di prenotazione";
        String body = "Purtroppo il locale ID: " + event.venueId() + " non ha potuto accettare la tua richiesta per la prenotazione #" + event.bookingId() + ".";
        emailService.sendEmail("easygigapp1.0@gmail.com", subject, body);

        saveInAppNotification(event.artistId(), "Richiesta Rifiutata", body, "BOOKING");
    }

    @KafkaListener(topics = "system-errors", groupId = "notification-group")
    public void consumeSystemErrors(java.util.Map<String, String> errorDetails) {
        String subject = "!!! ALERT: Sistema EasyGig - Errore in " + errorDetails.get("service");
        String body = String.format("È stato rilevato un errore critico in %s. Controlla i log.", errorDetails.get("service"));
        emailService.sendEmail("easygigapp1.0@gmail.com", subject, body);
    }

}
