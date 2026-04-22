package org.spring.profileservice.controller;

import org.spring.profileservice.dto.VenueRequest;
import org.spring.profileservice.dto.VenueResponse;
import org.spring.profileservice.service.VenueService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/venues")
public class VenueController {

    @Autowired
    private VenueService venueService;

    @PostMapping(path="/", consumes = "application/json", produces = "application/json")
    public ResponseEntity<VenueResponse> createVenue(@RequestBody VenueRequest venueRequest) {
        VenueResponse response = venueService.createVenue(venueRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping(path="/{venueId}", consumes = "application/json", produces = "application/json")
    public ResponseEntity<VenueResponse> updateVenue(@RequestBody VenueRequest venueRequest, @PathVariable("venueId") Long venueId) {
        VenueResponse response = venueService.updateVenue(venueRequest, venueId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping(path = "/{venueId}")
    public ResponseEntity<Void> deleteVenue(@PathVariable("venueId") Long venueId) {
        venueService.deleteVenue(venueId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping(path = "/{venueId}", produces = "application/json")
    public ResponseEntity<VenueResponse> getVenueById(@PathVariable("venueId") Long venueId) {
        VenueResponse response = venueService.getVenueById(venueId);
        return ResponseEntity.ok(response);
    }
    @GetMapping(path = "/", produces = "application/json")
    public ResponseEntity<List<VenueResponse>> getAllVenues() {
        List<VenueResponse> response = venueService.getAllVenue();
        return ResponseEntity.ok(response);
    }
}
