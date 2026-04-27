package org.spring.profileservice.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.spring.profileservice.dto.UserRegistrationRequest;
import org.spring.profileservice.dto.UserResponse;
import org.spring.profileservice.entity.User;
import org.spring.profileservice.exception.EmailGiaEsistenteException;
import org.spring.profileservice.exception.InvalidTokenException;
import org.spring.profileservice.mapper.UserMapper;
import org.spring.profileservice.repository.StateAccountRepository;
import org.spring.profileservice.repository.UserRepository;
import org.spring.profileservice.utility.UserType;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private UserMapper userMapper;
    @Mock
    private InvitationService invitationService;
    @Mock
    private JwtService jwtService;
    @Mock
    private StateAccountRepository stateAccountRepository;
    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    private UserRegistrationRequest registrationRequest;
    private User user;

    @BeforeEach
    void setUp() {
        registrationRequest = new UserRegistrationRequest(
                "test@example.com",
                "password123",
                "Mario",
                "Rossi",
                UserType.ARTIST,
                true
        );

        user = new User();
        user.setId(1L);
        user.setEmail("test@example.com");
        user.setFirstName("Mario");
        user.setLastName("Rossi");
        user.setRole(UserType.ARTIST);
    }

    @Test
    void registerUser_Success_NoToken() {
        // Arrange
        when(userRepository.findByEmail(registrationRequest.email())).thenReturn(Optional.empty());
        when(userMapper.toEntity(registrationRequest)).thenReturn(user);
        when(passwordEncoder.encode(registrationRequest.password())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(user);
        when(userMapper.toResponse(user)).thenReturn(new UserResponse(1L, "test@example.com", "Mario", "Rossi", UserType.ARTIST, 0.0, 0, null));

        // Act
        UserResponse response = userService.registerUser(registrationRequest, null);

        // Assert
        assertNotNull(response);
        assertEquals("test@example.com", response.email());
        verify(userRepository, times(1)).save(any(User.class));
        verify(invitationService, never()).acceptInvitation(anyString(), anyLong());
    }

    @Test
    void registerUser_Success_WithToken() {
        // Arrange
        String token = "valid-token";
        when(jwtService.validateToken(token, registrationRequest.email())).thenReturn(true);
        when(userRepository.findByEmail(registrationRequest.email())).thenReturn(Optional.empty());
        when(userMapper.toEntity(registrationRequest)).thenReturn(user);
        when(passwordEncoder.encode(registrationRequest.password())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(user);
        when(userMapper.toResponse(user)).thenReturn(new UserResponse(1L, "test@example.com", "Mario", "Rossi", UserType.ARTIST, 0.0, 0, null));

        // Act
        UserResponse response = userService.registerUser(registrationRequest, token);

        // Assert
        assertNotNull(response);
        verify(jwtService, times(1)).validateToken(token, registrationRequest.email());
        verify(invitationService, times(1)).acceptInvitation(token, user.getId());
    }

    @Test
    void registerUser_ThrowsException_WhenEmailExists() {
        // Arrange
        when(userRepository.findByEmail(registrationRequest.email())).thenReturn(Optional.of(user));

        // Act & Assert
        assertThrows(EmailGiaEsistenteException.class, () -> userService.registerUser(registrationRequest, null));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void registerUser_ThrowsException_WhenTokenInvalid() {
        // Arrange
        String token = "invalid-token";
        when(jwtService.validateToken(token, registrationRequest.email())).thenReturn(false);

        // Act & Assert
        assertThrows(InvalidTokenException.class, () -> userService.registerUser(registrationRequest, token));
        verify(userRepository, never()).save(any(User.class));
    }
}
