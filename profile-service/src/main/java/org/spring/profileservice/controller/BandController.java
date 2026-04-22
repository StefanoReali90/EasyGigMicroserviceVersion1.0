package org.spring.profileservice.controller;

import org.spring.profileservice.dto.*;
import org.spring.profileservice.service.BandService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.RequestEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/bands")
public class BandController {

    @Autowired
    private BandService bandService;

    @PostMapping(path = "/", consumes = "application/json", produces = "application/json")
    public ResponseEntity<BandFullResponse> addBand(@RequestBody BandRegistrationRequest dto) {
        BandFullResponse response = bandService.addBand(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping(path = "/{id}", consumes = "application/json", produces= "application/json")
    public ResponseEntity<BandFullResponse> updateBand(@PathVariable Long id, @RequestBody BandRegistrationRequest dto) {
        BandFullResponse response = bandService.updateBand(dto,id);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping(path = "/{id}")
    public ResponseEntity<Void> deleteBand(@PathVariable Long id) {
        bandService.deleteBand(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping(path= "/{id}", produces = "application/json")
    public ResponseEntity<BandSearchResponse> getBand(@PathVariable Long id) {
        BandSearchResponse response = bandService.getBand(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping(path = "/{id}/members", produces = "application/json")
    public ResponseEntity<List<BandMemberResponse>> getBandMembers(@PathVariable Long id) {
        List<BandMemberResponse> response = bandService.getBandMembers(id);
        return ResponseEntity.ok(response);
    }

    @PatchMapping(path= "/{userId}/{bandId}/{memberId}")
    public ResponseEntity<Void> addBandMember(@PathVariable Long bandId, @PathVariable Long memberId, Long userId) {
        bandService.addBandMember(bandId, memberId, userId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping(path = "/{userId}/{bandId}/{memberId}")
    public ResponseEntity<Void> deleteBandMember(@PathVariable Long bandId, @PathVariable Long memberId, @PathVariable Long userId) {
        bandService.removeBandMember(bandId, memberId,userId);
        return ResponseEntity.noContent().build();
    }




}
