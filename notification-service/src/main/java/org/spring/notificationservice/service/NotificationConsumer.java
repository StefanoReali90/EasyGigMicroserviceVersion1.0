package org.spring.notificationservice.service;

import lombok.RequiredArgsConstructor;
import org.spring.notificationservice.dto.BookingCanceledEvent;
import org.spring.notificationservice.dto.BookingExpiredEvent;
import org.spring.notificationservice.dto.InvitationEventDTO;
import org.spring.notificationservice.entity.NotificationLog;
import org.spring.notificationservice.exception.EmailSendingException;
import org.spring.notificationservice.repository.NotificationLogRepository;
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

    @KafkaListener(topics = "booking-expired-topic", groupId = "notification-group")
    public void consumeBookingExpired(BookingExpiredEvent event) {
        String subject = "Prenotazione scaduta - Strike ricevuto";
        String body = "Non hai risposto alla prenotazione #" + event.bookingId() +
                " entro 5 giorni. Ti è stato assegnato uno strike.";
        emailService.sendEmail("test@easygig.com", subject, body);
    }

    /**
     * Listener dedicato al monitoraggio degli errori critici del sistema.
     * Intercetta gli alert inviati dagli Aspect AOP di tutti i microservizi 
     * e notifica l'amministratore via email in tempo reale.
     */
    @KafkaListener(topics = "system-errors", groupId = "notification-group")
    public void consumeSystemErrors(java.util.Map<String, String> errorDetails) {
        String subject = "!!! ALERT: Sistema EasyGig - Errore in " + errorDetails.get("service");
        String body = String.format(
            "È stato rilevato un errore critico:\n\n" +
            "Servizio: %s\n" +
            "Classe: %s\n" +
            "Metodo: %s\n" +
            "Errore: %s\n\n" +
            "Controlla i log per maggiori dettagli.",
            errorDetails.get("service"),
            errorDetails.get("class"),
            errorDetails.get("method"),
            errorDetails.get("error")
        );
        
        // Invio la mail a te (l'admin del sistema)
        emailService.sendEmail("easygigapp1.0@gmail.com", subject, body);
    }
}
