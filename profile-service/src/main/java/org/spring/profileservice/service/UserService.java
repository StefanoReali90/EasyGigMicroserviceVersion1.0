package org.spring.profileservice.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.spring.profileservice.dto.UserRegistrationRequest;
import org.spring.profileservice.dto.UserResponse;
import org.spring.profileservice.dto.UserUpdateRequest;
import org.spring.profileservice.entity.StateAccount;
import org.spring.profileservice.entity.User;
import org.spring.profileservice.exception.EmailGiaEsistenteException;
import org.spring.profileservice.exception.UtenteNonTrovatoException;
import org.spring.profileservice.mapper.UserMapper;
import org.spring.profileservice.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {


    private final UserRepository userRepository;
    private final UserMapper userMapper;

    @Transactional
    public UserResponse registerUser(UserRegistrationRequest request){
        if(userRepository.findByEmail(request.email()).isPresent()){
            throw new EmailGiaEsistenteException("E-mail già esistente");
        }
        User user = userMapper.toEntity(request);
        user.setPasswordHash("BCRYPT_SIMULATED_" + request.password());
        StateAccount state = new StateAccount();
        user.setStateAccount(state);
        User savedUser = userRepository.save(user);
        return userMapper.toResponse(savedUser);
    }
    @Transactional
    public UserResponse updateUser(UserUpdateRequest request, Long id){
        User user = userRepository.findById(id).orElseThrow(()-> new UtenteNonTrovatoException("Utente non trovato"));
        userMapper.updateUserFromDto(request,user);
        if(request.password() != null && !request.password().isBlank() ){
            user.setPasswordHash("BCRYPT_SIMULATED_" + request.password());
        }
        return userMapper.toResponse(userRepository.save(user));

    }
    @Transactional
    public void deleteUser(Long id){
        if(!userRepository.existsById(id)){
            throw new UtenteNonTrovatoException("Utente non trovato");
        }
        userRepository.deleteById(id);
    }
}
