package org.spring.apigateway.filter;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import java.security.Key;
@Component
public class AuthenticationFilter extends AbstractGatewayFilterFactory<AuthenticationFilter.Config> {
    // Assicurati che nel file application.yml dell'api-gateway ci sia la stessa identica
    // chiave segreta (secret-key) che usi nel profile-service!
    @Value("${application.security.jwt.secret-key}")
    private String secretKey;
    public AuthenticationFilter() {
        super(Config.class);
    }
    @Override
    public GatewayFilter apply(Config config) {
        return ((exchange, chain) -> {

            // 1. Il buttafuori controlla se c'è l'intestazione "Authorization"
            if (!exchange.getRequest().getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
                exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                return exchange.getResponse().setComplete();
            }
            String authHeader = exchange.getRequest().getHeaders().get(HttpHeaders.AUTHORIZATION).get(0);

            // 2. Assicuriamo che il token inizi con "Bearer "
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                authHeader = authHeader.substring(7); // Rimuove "Bearer " per tenere solo il token puro
            } else {
                exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                return exchange.getResponse().setComplete();
            }
            try {
                // 3. Verifica e decodifica il token con la chiave segreta
                byte[] keyBytes = Decoders.BASE64.decode(secretKey);
                Key key = Keys.hmacShaKeyFor(keyBytes);

                Claims claims = Jwts.parser()
                        .verifyWith((javax.crypto.SecretKey) key)
                        .build()
                        .parseSignedClaims(authHeader)
                        .getPayload();
                // 4. Estrai i dati dell'utente dal token
                String userEmail = claims.getSubject();
                Long userId = claims.get("userId", Long.class);

                // 5. AGGIUNGI LE INTESTAZIONI: 
                // Il Gateway aggiunge l'email e l'ID dell'utente a degli header
                //
                ServerWebExchange modifiedExchange = exchange.mutate()
                        .request(exchange.getRequest().mutate()
                                .header("X-Auth-User", userEmail)
                                .header("X-User-Id", String.valueOf(userId))
                                .build())
                        .build();
                // 6. Fai passare la richiesta modificata ai microservizi!
                return chain.filter(modifiedExchange);
            } catch (Exception e) {
                // Se il token è falso, contraffatto o scaduto, la libreria lancia un'eccezione
                // e il buttafuori blocca la porta.
                exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                return exchange.getResponse().setComplete();
            }
        });
    }
    public static class Config {
        // Obbligatorio per Spring Cloud Gateway, qui andrebbero configurazioni opzionali
    }
}