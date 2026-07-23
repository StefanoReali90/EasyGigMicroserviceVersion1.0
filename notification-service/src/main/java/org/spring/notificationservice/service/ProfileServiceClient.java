package org.spring.notificationservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.Optional;

/**
 * Client HTTP verso il profile-service per recuperare le email reali degli utenti.
 *
 * <p>In un'architettura a microservizi matura si utilizzerebbe un Feign Client (spring-cloud-openfeign).
 * Poiché il modulo non ha la dipendenza Feign, usiamo RestTemplate con risoluzione service-discovery
 * tramite Eureka (il base-url usa il nome Eureka del servizio via load-balancer).</p>
 *
 * <p>Per abilitare la load-balanced resolution, il bean RestTemplate deve essere annotato
 * con {@code @LoadBalanced}. La configurazione è in {@link RestTemplateConfig}.</p>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ProfileServiceClient {

    private final RestTemplate restTemplate;

    private static final String PROFILE_SERVICE_BASE = "http://profile-service";

    /**
     * Recupera l'email di un utente dato il suo ID.
     * Ritorna empty se il profilo non è raggiungibile o l'utente non esiste.
     *
     * @param userId ID dell'utente
     * @return Optional con l'email, oppure empty in caso di errore
     */
    @io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker(name = "profileService", fallbackMethod = "getUserEmailFallback")
    public Optional<String> getUserEmail(Long userId) {
        if (userId == null) return Optional.empty();
        try {
            UserEmailProjection projection = restTemplate.getForObject(
                PROFILE_SERVICE_BASE + "/users/" + userId,
                UserEmailProjection.class
            );
            if (projection != null && projection.email() != null && !projection.email().isBlank()) {
                return Optional.of(projection.email());
            }
            return Optional.empty();
        } catch (RestClientException e) {
            log.warn("[ProfileServiceClient] Impossibile recuperare l'email per userId={}: {}", userId, e.getMessage());
            return Optional.empty();
        }
    }

    /**
     * Fallback invocato dal Circuit Breaker quando il profile-service è irraggiungibile per troppo tempo.
     */
    public Optional<String> getUserEmailFallback(Long userId, Throwable t) {
        log.error("[CircuitBreaker FALLBACK] profile-service non disponibile per userId={}. Errore: {}", userId, t.getMessage());
        return Optional.empty();
    }

    /**
     * Proiezione minimale della risposta del profile-service.
     * Il record mappa solo il campo 'email' dalla risposta JSON di GET /users/{id}.
     */
    public record UserEmailProjection(Long id, String email, String firstName, String lastName) {}
}
