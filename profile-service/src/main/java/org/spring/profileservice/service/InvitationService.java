package org.spring.profileservice.service;

import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import org.spring.profileservice.entity.Band;
import org.spring.profileservice.entity.Invitation;
import org.spring.profileservice.exception.BandNonTrovataException;
import org.spring.profileservice.exception.InvalidTokenException;
import org.spring.profileservice.exception.InvitationAlreadyProcessedException;
import org.spring.profileservice.exception.InvitationNotFoundException;
import org.spring.profileservice.repository.BandRepository;
import org.spring.profileservice.repository.InvitationRepository;
import org.spring.profileservice.utility.InvitationStatus;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class InvitationService {

    private final InvitationRepository invitationRepository;

    private final JwtService jwtService;

    private final BandRepository bandRepository;


    public void createInvitation(String email, Long idBand) {
        Band band = bandRepository.findById(idBand).orElseThrow(() -> new BandNonTrovataException("Band non trovata"));
        Map<String, Object> claims = new HashMap<>();
        claims.put("bandId", idBand);
        String token = jwtService.generateToken(claims, email);
        Invitation invitation = new Invitation();
        invitation.setEmail(email);
        invitation.setBand(band);
        invitation.setTokenJwt(token);
        invitation.setStatus(InvitationStatus.PENDING);
        invitationRepository.save(invitation);

    }

    public void acceptInvitation(String token, Long newUserId) {
        Long bandId = jwtService.extractBandId(token);
        String email = jwtService.getClaim(token, Claims::getSubject);

        if (!jwtService.validateToken(token, email)) {
            throw new InvalidTokenException("Il link di invito è scaduo o non valido");
        }
        Invitation invitation = invitationRepository.findByTokenJwt(token);

        if (invitation == null || invitation.getStatus() != InvitationStatus.PENDING) {
            throw new InvitationAlreadyProcessedException("Questo invito è già stato utilizzato o non è valido");
        }

        Band band = invitation.getBand();

        if (!band.getMemberIds().contains(newUserId)) {

            band.getMemberIds().add(newUserId);
            bandRepository.save(band);

        }
        invitation.setStatus(InvitationStatus.ACCEPTED);
        invitationRepository.save(invitation);


    }
}
