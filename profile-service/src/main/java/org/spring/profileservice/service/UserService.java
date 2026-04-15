package org.spring.profileservice.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.spring.profileservice.dto.AccountStatusResponse;
import org.spring.profileservice.dto.UserRegistrationRequest;
import org.spring.profileservice.dto.UserResponse;
import org.spring.profileservice.dto.UserUpdateRequest;
import org.spring.profileservice.entity.StateAccount;
import org.spring.profileservice.entity.User;
import org.spring.profileservice.exception.EmailGiaEsistenteException;
import org.spring.profileservice.exception.InvalidTokenException;
import org.spring.profileservice.exception.UserNotFoundException;
import org.spring.profileservice.mapper.AccountStatusMapper;
import org.spring.profileservice.mapper.UserMapper;
import org.spring.profileservice.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {


    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final InvitationService invitationService;
    private final JwtService jwtService;
    private final AccountStatusMapper accountStatusMapper;

    @Transactional
    public UserResponse registerUser(UserRegistrationRequest request, String token) {
        if (token != null && !token.isEmpty()) {
            if(!jwtService.validateToken(token, request.email())){
                throw new InvalidTokenException("L'email di registrazione non corrisponde a quella dell'invito o il token è invalido.");
            }
        }
        if(userRepository.findByEmail(request.email()).isPresent()){
            throw new EmailGiaEsistenteException("E-mail già esistente");
        }
        User user = userMapper.toEntity(request);
        user.setPasswordHash("BCRYPT_SIMULATED_" + request.password());
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
            user.setPasswordHash("BCRYPT_SIMULATED_" + request.password());
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

    public UserResponse getUser(Long id){
        if(!userRepository.existsById(id)){
            throw new UserNotFoundException("Utente non trovato");
        }
        return userMapper.toResponse(userRepository.findById(id).get());
    }

    public AccountStatusResponse getUserStatus(Long id){
        User user = userRepository.findById(id).orElseThrow(()-> new UserNotFoundException("User non trovato"));
        StateAccount stateAccount = user.getStateAccount();
        return accountStatusMapper.toResponse(stateAccount);
    }




}
