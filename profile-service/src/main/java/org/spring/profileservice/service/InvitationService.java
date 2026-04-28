package org.spring.profileservice.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import lombok.RequiredArgsConstructor;
import org.spring.profileservice.dto.InvitationEventDTO;
import org.spring.profileservice.entity.Band;
import org.spring.profileservice.entity.BookingOrganization;
import org.spring.profileservice.entity.Invitation;
import org.spring.profileservice.entity.User;
import org.spring.profileservice.exception.*;
import org.spring.profileservice.model.InvitingGroup;
import org.spring.profileservice.repository.BandRepository;
import org.spring.profileservice.repository.BookingOrganizationRepository;
import org.spring.profileservice.repository.InvitationRepository;
import org.spring.profileservice.repository.UserRepository;
import org.spring.profileservice.utility.GroupType;
import org.spring.profileservice.utility.InvitationStatus;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

/**
 * Servizio per la gestione degli inviti ai gruppi (Band o Organizzazioni).
 * Gestisce la generazione di token di invito e la persistenza dello stato.
 */
@Service
@RequiredArgsConstructor
public class InvitationService {

    private final InvitationRepository invitationRepository;
    private final JwtService jwtService;
    private final BandRepository bandRepository;
    private final BookingOrganizationRepository bookingOrganizationRepository;
    private final UserRepository userRepository;

    // KafkaTemplate per il disaccoppiamento con il Notification Service
    private final KafkaTemplate<String, InvitationEventDTO> kafkaTemplate;

    @Value("${application.invitation.expiry-days}")
    private int expiryDays;

    /**
     * Crea un nuovo invito, genera un token JWT dedicato e notifica il sistema di messaggistica.
     * Verifica preventivamente l'autorizzazione del mittente all'interno del gruppo.
     */
    public void createInvitation(String email, Long groupId, Long senderId, GroupType type) {
        InvitingGroup group = findGroupById(groupId, type);

        // Controllo autorizzazione
        boolean isAuthorized = group.getMembers().stream()
                .anyMatch(user -> user.getId().equals(senderId));

        if (!isAuthorized) {
            throw new UnauthorizedException("Non hai i permessi per invitare membri in questo gruppo");
        }

        // Generazione Token
        Map<String, Object> claims = new HashMap<>();
        claims.put("groupId", groupId);
        claims.put("groupType", type.name());
        String token = jwtService.generateToken(claims, email);

        // Salvataggio Invito nel DB locale
        Invitation invitation = new Invitation();
        invitation.setEmail(email);
        invitation.setTokenJwt(token);
        invitation.setGroupId(groupId);
        invitation.setGroupType(type);
        invitation.setStatus(InvitationStatus.PENDING);
        invitationRepository.save(invitation);

        // Preparo il pacchetto per il Notification Service
        InvitationEventDTO event = new InvitationEventDTO(
                email,
                group.getName(),
                token,
                type,
                group.getMembers().size()
        );

        // Invio del messaggio a Kafka
        kafkaTemplate.send("invitation-topic", event);
    }

    /**
     * Processa l'accettazione di un invito tramite token.
     * Valida la firma del JWT, verifica lo stato della richiesta e associa l'utente al gruppo target.
     */
    public void acceptInvitation(String token, Long newUserId) {
        try {
            // Estrazione claims dal token JWT
            String email = jwtService.getClaim(token, Claims::getSubject);
            Long groupId = jwtService.getClaim(token, claims -> claims.get("groupId", Long.class));
            String typeStr = jwtService.getClaim(token, claims -> claims.get("groupType", String.class));
            GroupType type = GroupType.valueOf(typeStr);

            if (!jwtService.validateToken(token, email)) {
                throw new InvalidTokenException("Il link non è valido");
            }

            Invitation invitation = invitationRepository.findByTokenJwt(token);
            if (invitation == null || invitation.getStatus() != InvitationStatus.PENDING) {
                throw new InvitationAlreadyProcessedException("Invito non valido o già usato");
            }

            InvitingGroup group = findGroupById(groupId, type);
            User user = userRepository.findById(newUserId)
                    .orElseThrow(() -> new UserNotFoundException("Utente non trovato"));

            group.addMember(user);
            saveGroup(group, type);

            invitation.setStatus(InvitationStatus.ACCEPTED);
            invitationRepository.save(invitation);

        } catch (ExpiredJwtException e) {
            throw new InvalidTokenException("L'invito è scaduto, contatta l'organizzatore");
        }
    }

    // Metodi di utility
    private InvitingGroup findGroupById(Long groupId, GroupType type) {
        if (type == GroupType.BAND) {
            return (InvitingGroup) bandRepository.findById(groupId)
                    .orElseThrow(() -> new BandNonTrovataException("Band non trovata"));
        } else {
            return (InvitingGroup) bookingOrganizationRepository.findById(groupId)
                    .orElseThrow(() -> new OrganizationNotFoundException("Organizzazione non trovata"));
        }
    }

    private void saveGroup(InvitingGroup group, GroupType type) {
        if (type == GroupType.BAND) {
            bandRepository.save((Band) group);
        } else {
            bookingOrganizationRepository.save((BookingOrganization) group);
        }
    }
}