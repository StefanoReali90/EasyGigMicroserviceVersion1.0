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
    public ResponseEntity<MusicTrack> uploadTrackToBand(
            @PathVariable Long bandId,
            @RequestParam String title,
            @RequestParam("file") MultipartFile file) throws IOException {
        return ResponseEntity.ok(trackService.uploadTrackToBand(bandId, title, file));
    }

    @PostMapping("/bands/{bandId}/external")
    public ResponseEntity<MusicTrack> addExternalTrackToBand(
            @PathVariable Long bandId,
            @RequestBody ExternalTrackRequest request) {
        return ResponseEntity.ok(trackService.addExternalTrackToBand(bandId, request.title(), request.url()));
    }

    @PostMapping("/artists/{userId}/upload")
    public ResponseEntity<MusicTrack> uploadTrackToArtist(
            @PathVariable Long userId,
            @RequestParam String title,
            @RequestParam("file") MultipartFile file) throws IOException {
        return ResponseEntity.ok(trackService.uploadTrackToArtist(userId, title, file));
    }

    @PostMapping("/artists/{userId}/external")
    public ResponseEntity<MusicTrack> addExternalTrackToArtist(
            @PathVariable Long userId,
            @RequestBody ExternalTrackRequest request) {
        return ResponseEntity.ok(trackService.addExternalTrackToArtist(userId, request.title(), request.url()));
    }
}
