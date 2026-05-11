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
public class CityController {

    @Autowired
    private CityRepository cityRepository;

    @GetMapping("/search")
    public ResponseEntity<List<CityResponse>> searchCities(@RequestParam String name) {
        List<CityResponse> cities = cityRepository.findByNameContainingIgnoreCase(name)
                .stream()
                .sorted((c1, c2) -> {
                    boolean c1Starts = c1.getName().toLowerCase().startsWith(name.toLowerCase());
                    boolean c2Starts = c2.getName().toLowerCase().startsWith(name.toLowerCase());
                    if (c1Starts && !c2Starts) return -1;
                    if (!c1Starts && c2Starts) return 1;
                    return c1.getName().compareToIgnoreCase(c2.getName());
                })
                .limit(20)
                .map(city -> new CityResponse(city.getId(), city.getName()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(cities);
    }
}
