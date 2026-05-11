package org.spring.profileservice.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.spring.profileservice.dto.AuthRequest;
import org.spring.profileservice.dto.AuthResponse;
import org.spring.profileservice.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller per la gestione del ciclo di vita dell'autenticazione.
 * Responsabile dell'emissione dei token JWT a seguito della validazione delle credenziali.
 */
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Endpoint per la sicurezza e il rilascio dei token di accesso")
public class AuthController {

    private final UserService userService;

    /**
     * Endpoint di autenticazione primaria.
     * Riceve le credenziali in formato AuthRequest e restituisce il profilo utente con il relativo JWT.
     */
    @PostMapping("/login")
    @Operation(summary = "Autenticazione utente", description = "Verifica le credenziali e genera un token JWT per le sessioni successive.")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
        return ResponseEntity.ok(userService.authenticate(request));
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Richiesta recupero password", description = "Genera un token di reset e lo associa all'utente.")
    public ResponseEntity<Void> forgotPassword(@RequestParam String email) {
        userService.createPasswordResetTokenForUser(email);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Reset password", description = "Valida il token e aggiorna la password dell'utente.")
    public ResponseEntity<Void> resetPassword(@RequestParam String token, @RequestParam String newPassword) {
        userService.resetPassword(token, newPassword);
        return ResponseEntity.ok().build();
    }
}
