package org.spring.profileservice.config;

import lombok.RequiredArgsConstructor;
import org.spring.profileservice.entity.StateAccount;
import org.spring.profileservice.entity.User;
import org.spring.profileservice.repository.UserRepository;
import org.spring.profileservice.utility.UserType;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final org.spring.profileservice.repository.GenreRepository genreRepository;

    @Override
    public void run(String... args) {
        seedUser("artista@easygig.com", "Mario", "Rossi", UserType.ARTIST);
        seedUser("direttore@easygig.com", "Luigi", "Verdi", UserType.DIRECTOR);
        seedUser("promoter@easygig.com", "Marco", "Bianchi", UserType.PROMOTER);
        seedGenres();
    }

    private void seedGenres() {
        String[] genres = {"Rock", "Pop", "Jazz", "Blues", "Metal", "Electronic", "Classical", "Hip Hop", "Reggae", "Indie", "Folk", "Latin", "Funk", "Soul"};
        for (String name : genres) {
            if (!genreRepository.existsByName(name)) {
                org.spring.profileservice.entity.Genre genre = new org.spring.profileservice.entity.Genre();
                genre.setName(name);
                genreRepository.save(genre);
            }
        }
    }

    private void seedUser(String email, String firstName, String lastName, UserType role) {
        if (userRepository.findByEmail(email).isEmpty()) {
            User user = new User();
            user.setEmail(email);
            user.setFirstName(firstName);
            user.setLastName(lastName);
            user.setPasswordHash(passwordEncoder.encode("password123"));
            user.setRole(role);
            user.setReputation(4.5);
            user.setReviewCount(10);
            user.setPrivacyAccepted(true);
            
            StateAccount state = new StateAccount();
            state.setStrikes(0);
            state.setBanned(false);
            user.setStateAccount(state);
            
            userRepository.save(user);
            System.out.println("Utente creato: " + email + " con ruolo " + role);
        }
    }
}
