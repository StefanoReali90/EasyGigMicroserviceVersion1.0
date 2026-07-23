package org.spring.apigateway.filter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;

import java.security.Key;
import java.util.Base64;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;

@Component
public class AuthenticationFilter extends AbstractGatewayFilterFactory<AuthenticationFilter.Config> {

    @Value("${application.security.jwt.secret-key}")
    private String secretKey;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public AuthenticationFilter() {
        super(Config.class);
    }

    @Override
    public GatewayFilter apply(Config config) {
        return ((exchange, chain) -> {
            if (HttpMethod.OPTIONS.equals(exchange.getRequest().getMethod())) {
                return chain.filter(exchange);
            }

            if (!exchange.getRequest().getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
                exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                return exchange.getResponse().setComplete();
            }
            String authHeader = exchange.getRequest().getHeaders().get(HttpHeaders.AUTHORIZATION).get(0);

            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                authHeader = authHeader.substring(7);
            } else {
                exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                return exchange.getResponse().setComplete();
            }

            try {
                String userEmail = null;
                String userId = null;

                // Supporto duale: prova decodifica Keycloak unverified payload o HMAC secret
                if (authHeader.split("\\.").length == 3) {
                    try {
                        String payloadJson = new String(Base64.getUrlDecoder().decode(authHeader.split("\\.")[1]));
                        JsonNode jsonNode = objectMapper.readTree(payloadJson);
                        
                        if (jsonNode.has("preferred_username") || jsonNode.has("iss") && jsonNode.get("iss").asText().contains("keycloak")) {
                            userEmail = jsonNode.has("email") ? jsonNode.get("email").asText() : jsonNode.get("preferred_username").asText();
                            userId = jsonNode.has("userId") ? jsonNode.get("userId").asText() : jsonNode.get("sub").asText();
                        }
                    } catch (Exception ignored) {}
                }

                if (userEmail == null) {
                    byte[] keyBytes = Decoders.BASE64.decode(secretKey);
                    Key key = Keys.hmacShaKeyFor(keyBytes);

                    Claims claims = Jwts.parser()
                            .verifyWith((javax.crypto.SecretKey) key)
                            .build()
                            .parseSignedClaims(authHeader)
                            .getPayload();

                    userEmail = claims.getSubject();
                    Object userIdObj = claims.get("userId");
                    userId = (userIdObj != null) ? String.valueOf(userIdObj) : "null";
                }

                ServerWebExchange modifiedExchange = exchange.mutate()
                        .request(exchange.getRequest().mutate()
                                .header("X-Auth-User", userEmail)
                                .header("X-User-Id", userId)
                                .build())
                        .build();

                return chain.filter(modifiedExchange);
            } catch (Exception e) {
                System.err.println("ERRORE GATEWAY: Validazione token fallita: " + e.getMessage());
                exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                return exchange.getResponse().setComplete();
            }
        });
    }

    public static class Config {
    }
}