package org.spring.profileservice.controller;

import lombok.RequiredArgsConstructor;
import org.spring.profileservice.dto.ExternalTrackRequest;
import org.spring.profileservice.entity.MusicTrack;
import org.spring.profileservice.service.TrackService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/tracks")
@RequiredArgsConstructor
public class TrackController {

    private final TrackService trackService;

    @PostMapping("/bands/{bandId}/upload")
    public ResponseEntity<org.spring.profileservice.dto.TrackResponse> uploadTrackToBand(
            @PathVariable Long bandId,
            @RequestParam String title,
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file) throws java.io.IOException {
        org.spring.profileservice.entity.MusicTrack t = trackService.uploadTrackToBand(bandId, title, file);
        return ResponseEntity.ok(new org.spring.profileservice.dto.TrackResponse(t.getId(), t.getTitle(), t.getUrl(), t.isExternal()));
    }

    @PostMapping("/bands/{bandId}/external")
    public ResponseEntity<org.spring.profileservice.dto.TrackResponse> addExternalTrackToBand(
            @PathVariable Long bandId,
            @RequestBody org.spring.profileservice.dto.ExternalTrackRequest request) {
        org.spring.profileservice.entity.MusicTrack t = trackService.addExternalTrackToBand(bandId, request.title(), request.url());
        return ResponseEntity.ok(new org.spring.profileservice.dto.TrackResponse(t.getId(), t.getTitle(), t.getUrl(), t.isExternal()));
    }

    @PostMapping("/artists/{userId}/upload")
    public ResponseEntity<org.spring.profileservice.dto.TrackResponse> uploadTrackToArtist(
            @PathVariable Long userId,
            @RequestParam String title,
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file) throws java.io.IOException {
        org.spring.profileservice.entity.MusicTrack t = trackService.uploadTrackToArtist(userId, title, file);
        return ResponseEntity.ok(new org.spring.profileservice.dto.TrackResponse(t.getId(), t.getTitle(), t.getUrl(), t.isExternal()));
    }

    @PostMapping("/artists/{userId}/external")
    public ResponseEntity<org.spring.profileservice.dto.TrackResponse> addExternalTrackToArtist(
            @PathVariable Long userId,
            @RequestBody org.spring.profileservice.dto.ExternalTrackRequest request) {
        org.spring.profileservice.entity.MusicTrack t = trackService.addExternalTrackToArtist(userId, request.title(), request.url());
        return ResponseEntity.ok(new org.spring.profileservice.dto.TrackResponse(t.getId(), t.getTitle(), t.getUrl(), t.isExternal()));
    }

    @GetMapping("/bands/{bandId}")
    public ResponseEntity<java.util.List<org.spring.profileservice.dto.TrackResponse>> getTracksByBand(@PathVariable Long bandId) {
        return ResponseEntity.ok(trackService.getTracksByBand(bandId).stream()
                .map(t -> new org.spring.profileservice.dto.TrackResponse(t.getId(), t.getTitle(), t.getUrl(), t.isExternal()))
                .toList());
    }

    @GetMapping("/artists/{userId}")
    public ResponseEntity<java.util.List<org.spring.profileservice.dto.TrackResponse>> getTracksByArtist(@PathVariable Long userId) {
        return ResponseEntity.ok(trackService.getTracksByArtist(userId).stream()
                .map(t -> new org.spring.profileservice.dto.TrackResponse(t.getId(), t.getTitle(), t.getUrl(), t.isExternal()))
                .toList());
    }
}
