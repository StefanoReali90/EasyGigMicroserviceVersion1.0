package org.spring.profileservice.controller;

import org.spring.profileservice.dto.BandFullResponse;
import org.spring.profileservice.dto.BandRegistrationRequest;
import org.spring.profileservice.service.BandService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.RequestEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/bands")
public class BandController {

    @Autowired
    private BandService bandService;

    @PostMapping(path = "/", consumes = "application/json", produces = "application/json")
    public ResponseEntity<BandFullResponse> addBand(@RequestBody BandRegistrationRequest dto) {
        BandFullResponse response = bandService.addBand(dto);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping(path = "/{id}", consumes = "application/json", produces= "application/json")
    public ResponseEntity<BandFullResponse> updateBand(@PathVariable Long id, @RequestBody BandRegistrationRequest dto) {
        BandFullResponse response = bandService.addBand(dto);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @DeleteMapping(path = "/{id}")
    public void deleteBand(@PathVariable Long id) {
        bandService.deleteBand(id);
    }
}
