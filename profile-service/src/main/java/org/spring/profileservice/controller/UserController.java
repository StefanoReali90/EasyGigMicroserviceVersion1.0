package org.spring.profileservice.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.mapstruct.control.MappingControl;
import org.spring.profileservice.dto.UserRegistrationRequest;
import org.spring.profileservice.dto.UserResponse;
import org.spring.profileservice.dto.UserUpdateRequest;
import org.spring.profileservice.repository.StateAccountRepository;
import org.spring.profileservice.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(path="/users")
@CrossOrigin(origins = "http://localhost:5173")
@Tag(name = "User Management", description = "API per la gestione degli utenti e dei loro profili")
public class UserController {

    @Autowired
    private UserService userService;


    @PostMapping(value = "/", consumes = "application/json")
    @Operation(summary = "Registra un nuovo utente", description = "Crea un nuovo profilo utente nel sistema.")
    public ResponseEntity<UserResponse> registerUser(@RequestBody UserRegistrationRequest request, @RequestParam(required = false) String token){
        UserResponse response = userService.registerUser(request,token);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping(path = "/{id}", consumes = "application/json")
    @Operation(summary = "Aggiorna un utente esistente", description = "Modifica le informazioni del profilo di un utente specifico.")
    public ResponseEntity<UserResponse> updateUser(@PathVariable Long id, @RequestBody UserUpdateRequest request){
        UserResponse response = userService.updateUser(request, id);
        return ResponseEntity.ok(response);
    }

    @GetMapping(path = "/{id}", produces = "application/json")
    @Operation(summary = "Ottieni dettagli utente", description = "Ritorna le informazioni dettagliate di un utente tramite il suo ID.")
    public ResponseEntity<UserResponse> getUser(@PathVariable Long id){
        UserResponse response = userService.getUser(id);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping(path= "{id}")
    @Operation(summary = "Elimina un utente", description = "Rimuove definitivamente un utente dal sistema.")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id){
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }


    @PatchMapping(value =("/{id}/strikes/add"))
    @Operation(summary = "Aggiungi uno strike", description = "Incrementa il numero di strike (penalità) di un utente.")
    public ResponseEntity<Void> addStrikes(@PathVariable Long id){
        userService.addStrikes(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping(path = "/", produces = "application/json")
    @Operation(summary = "Lista utenti", description = "Ritorna una lista di tutti gli utenti registrati.")
    public ResponseEntity<java.util.List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PatchMapping(path=("/{id}/strikes/reset"))
    @Operation(summary = "Resetta gli strike", description = "Azzera il conteggio delle penalità per un utente.")
    public ResponseEntity<Void> resetStrikes(@PathVariable Long id){
        userService.resetStrikes(id);
        return ResponseEntity.noContent().build();
    }
}
