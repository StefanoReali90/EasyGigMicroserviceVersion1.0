package org.spring.profileservice.controller;

import org.spring.profileservice.dto.CityResponse;
import org.spring.profileservice.repository.CityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/cities")
@CrossOrigin(origins = "http://localhost:5173")
public class CityController {

    @Autowired
    private CityRepository cityRepository;

    @GetMapping("/search")
    public ResponseEntity<List<CityResponse>> searchCities(@RequestParam String name) {
        List<CityResponse> cities = cityRepository.findByNameContainingIgnoreCase(name)
                .stream()
                .limit(10) // Limita a 10 per performance
                .map(city -> new CityResponse(city.getId(), city.getName()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(cities);
    }
}
