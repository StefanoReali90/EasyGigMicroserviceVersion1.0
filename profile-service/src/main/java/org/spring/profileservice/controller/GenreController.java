package org.spring.profileservice.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import org.spring.profileservice.dto.GenreResponse;
import org.spring.profileservice.repository.GenreRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/genres")
@Tag(name = "Genre Management", description = "API per il recupero dei generi musicali")
public class GenreController {

    @Autowired
    private GenreRepository genreRepository;

    @GetMapping
    public ResponseEntity<List<GenreResponse>> getAllGenres() {
        List<GenreResponse> response = genreRepository.findAll().stream()
                .map(genre -> new GenreResponse(genre.getId(), genre.getName()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @org.springframework.web.bind.annotation.PostMapping
    public ResponseEntity<GenreResponse> createGenre(@org.springframework.web.bind.annotation.RequestBody String genreName) {
        // Pulizia del nome (rimozione virgolette se inviato come stringa semplice)
        String cleanedName = genreName.replace("\"", "").trim();
        
        return genreRepository.findByNameIgnoreCase(cleanedName)
                .map(g -> ResponseEntity.ok(new GenreResponse(g.getId(), g.getName())))
                .orElseGet(() -> {
                    org.spring.profileservice.entity.Genre newGenre = new org.spring.profileservice.entity.Genre();
                    newGenre.setName(cleanedName);
                    org.spring.profileservice.entity.Genre saved = genreRepository.save(newGenre);
                    return ResponseEntity.ok(new GenreResponse(saved.getId(), saved.getName()));
                });
    }
}
