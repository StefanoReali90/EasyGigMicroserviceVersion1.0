package org.spring.profileservice.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.spring.profileservice.dto.*;
import org.spring.profileservice.entity.StateAccount;
import org.spring.profileservice.entity.User;
import org.spring.profileservice.exception.*;
import org.spring.profileservice.mapper.AccountStatusMapper;
import org.spring.profileservice.mapper.UserMapper;
import org.spring.profileservice.repository.StateAccountRepository;
import org.spring.profileservice.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;

/**
 * Servizio per la gestione dell'anagrafica utenti e delle logiche di sicurezza.
 * Gestisce l'autenticazione, la registrazione (anche tramite invito), 
 * il sistema sanzionatorio (strikes) e il calcolo della reputazione.
 */
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final InvitationService invitationService;
    private final JwtService jwtService;
    private final AccountStatusMapper accountStatusMapper;
    private final StateAccountRepository stateAccountRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Valida le credenziali dell'utente e genera un token JWT di sessione.
     * @throws UserNotFoundException se l'email non è censita.
     * @throws UnauthorizedException se la password non corrisponde.
     */
    @Transactional
    public AuthResponse authenticate(AuthRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new UserNotFoundException("Utente non trovato"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new UnauthorizedException("Credenziali non valide");
        }

        String token = jwtService.generateToken(new HashMap<>(), user.getEmail());
        return new AuthResponse(token, userMapper.toResponse(user));
    }

    /**
     * Registra un nuovo utente nel sistema.
     * Supporta il workflow di invito: se viene fornito un token valido, 
     * l'utente viene automaticamente associato al gruppo di destinazione.
     */
    @Transactional
    public UserResponse registerUser(UserRegistrationRequest request, String token) {
        if (token != null && !token.isEmpty()) {
            if(!jwtService.validateToken(token, request.email())){
                throw new InvalidTokenException("Token di invito non valido o email non corrispondente.");
            }
        }
        if(userRepository.findByEmail(request.email()).isPresent()){
            throw new EmailGiaEsistenteException("Email già presente nel database");
        }
        User user = userMapper.toEntity(request);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        
        StateAccount state = new StateAccount();
        user.setStateAccount(state);
        
        User savedUser = userRepository.save(user);
        
        if(token != null && !token.isEmpty()){
            invitationService.acceptInvitation(token, savedUser.getId());
        }
        return userMapper.toResponse(savedUser);
    }

    @Transactional
    public UserResponse updateUser(UserUpdateRequest request, Long id){
        User user = userRepository.findById(id).orElseThrow(()-> new UserNotFoundException("Utente non trovato"));
        userMapper.updateUserFromDto(request,user);
        if(request.password() != null && !request.password().isBlank() ){
            user.setPasswordHash(passwordEncoder.encode(request.password()));
        }
        return userMapper.toResponse(userRepository.save(user));
    }

    @Transactional
    public void deleteUser(Long id){
        if(!userRepository.existsById(id)){
            throw new UserNotFoundException("Utente non trovato");
        }
        userRepository.deleteById(id);
    }

    public java.util.List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(userMapper::toResponse)
                .toList();
    }

    public UserResponse getUser(Long id){
        return userRepository.findById(id)
                .map(userMapper::toResponse)
                .orElseThrow(() -> new UserNotFoundException("Utente non trovato"));
    }

    public AccountStatusResponse getUserStatus(Long id){
        User user = userRepository.findById(id).orElseThrow(()-> new UserNotFoundException("User non trovato"));
        return accountStatusMapper.toResponse(user);
    }

    /**
     * Sistema sanzionatorio: incrementa gli strike dell'utente.
     * Al raggiungimento del 3° strike, scatta il ban temporaneo (7 o 14 giorni).
     */
    @Transactional
    public void addStrikes(Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new UserNotFoundException("User non trovato"));
        StateAccount stateAccount = user.getStateAccount();
        stateAccount.setStrikes(stateAccount.getStrikes() + 1);
        
        if (stateAccount.getStrikes() >= 3) {
            stateAccount.setBanned(true);
            int banDays = (stateAccount.getLastBanDate() != null) ? 14 : 7;
            stateAccount.setBanUntil(LocalDate.now().plusDays(banDays));
            stateAccount.setLastBanDate(LocalDateTime.now());
        }
        stateAccountRepository.save(stateAccount);
    }

    /**
     * Ripristina l'account se il periodo di ban è terminato.
     */
    @Transactional
    public void resetStrikes(Long id){
        User user = userRepository.findById(id).orElseThrow(() -> new UserNotFoundException("User non trovato"));
        StateAccount stateAccount = user.getStateAccount();
        if(stateAccount.getBanUntil() != null && !stateAccount.getBanUntil().isAfter(LocalDate.now())){
            stateAccount.setStrikes(0);
            stateAccount.setBanned(false);
            stateAccount.setBanUntil(null);
        }
    }

    /**
     * Aggiorna la reputazione dell'utente calcolando la media pesata dei feedback.
     */
    public void updateReputation(Long userId, int newRate) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utente non trovato"));
        
        Double oldReputation = user.getReputation();
        Integer reviewCount = user.getReviewCount();
        
        // Calcolo media ponderata
        Double newReputation = ((oldReputation * reviewCount) + newRate) / (reviewCount + 1);
        
        user.setReputation(Math.round(newReputation * 10.0) / 10.0);
        user.setReviewCount(reviewCount + 1);
        userRepository.save(user);
    }
}





