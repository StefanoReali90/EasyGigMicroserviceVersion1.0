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
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping(path = "/{id}", consumes = "application/json", produces= "application/json")
    public ResponseEntity<BandFullResponse> updateBand(@PathVariable Long id, @RequestBody BandRegistrationRequest dto) {
        BandFullResponse response = bandService.updateBand(dto,id);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @DeleteMapping(path = "/{id}")
    public void deleteBand(@PathVariable Long id) {
        bandService.deleteBand(id);
    }

    @GetMapping(path= "/{id}", produces = "application/json")
    public ResponseEntity<BandSearchResponse> getBand(@PathVariable Long id) {
        BandSearchResponse response = bandService.getBand(id);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping(path = "/{id}/members", produces = "application/json")
    public ResponseEntity<List<BandMemberResponse>> getBandMembers(@PathVariable Long id) {
        List<BandMemberResponse> response = bandService.getBandMembers(id);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PatchMapping(path= "/{bandId}/{memberId}")
    public void addBandMember(@PathVariable Long bandId, @PathVariable Long memberId) {
        bandService.addBandMember(bandId, memberId);
    }

    @DeleteMapping(path = "/{bandId}/{memberId}")
    public void deleteBandMember(@PathVariable Long bandId, @PathVariable Long memberId) {
        bandService.removeBandMember(bandId, memberId);
    }




}
