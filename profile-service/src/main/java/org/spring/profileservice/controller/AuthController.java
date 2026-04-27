package org.spring.profileservice.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.spring.profileservice.dto.AuthRequest;
import org.spring.profileservice.dto.AuthResponse;
import org.spring.profileservice.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
@Tag(name = "Authentication", description = "API per il login e l'autenticazione degli utenti")
public class AuthController {

    private final UserService userService;

    @PostMapping("/login")
    @Operation(summary = "Effettua il login", description = "Verifica le credenziali e restituisce un token JWT.")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
        return ResponseEntity.ok(userService.authenticate(request));
    }
}
