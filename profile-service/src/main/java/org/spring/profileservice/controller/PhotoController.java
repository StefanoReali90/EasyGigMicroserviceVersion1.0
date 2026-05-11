package org.spring.profileservice.controller;

import lombok.RequiredArgsConstructor;
import org.spring.profileservice.entity.Photo;
import org.spring.profileservice.service.PhotoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/photos")
@RequiredArgsConstructor
public class PhotoController {

    private final PhotoService photoService;

    @PostMapping("/bands/{bandId}")
    public ResponseEntity<org.spring.profileservice.dto.PhotoResponse> uploadBandPhoto(@PathVariable Long bandId, @RequestParam("file") MultipartFile file, @RequestParam(defaultValue = "false") boolean isPrimary) throws IOException {
        Photo p = photoService.uploadPhotoToBand(bandId, file, isPrimary);
        return ResponseEntity.ok(new org.spring.profileservice.dto.PhotoResponse(p.getId(), p.getSource(), p.isPrimary()));
    }

    @PostMapping("/venues/{venueId}")
    public ResponseEntity<org.spring.profileservice.dto.PhotoResponse> uploadVenuePhoto(@PathVariable Long venueId, @RequestParam("file") MultipartFile file, @RequestParam(defaultValue = "false") boolean isPrimary) throws IOException {
        Photo p = photoService.uploadPhotoToVenue(venueId, file, isPrimary);
        return ResponseEntity.ok(new org.spring.profileservice.dto.PhotoResponse(p.getId(), p.getSource(), p.isPrimary()));
    }

    @PostMapping("/organizations/{orgId}")
    public ResponseEntity<org.spring.profileservice.dto.PhotoResponse> uploadOrgPhoto(@PathVariable Long orgId, @RequestParam("file") MultipartFile file, @RequestParam(defaultValue = "false") boolean isPrimary) throws IOException {
        Photo p = photoService.uploadPhotoToOrganization(orgId, file, isPrimary);
        return ResponseEntity.ok(new org.spring.profileservice.dto.PhotoResponse(p.getId(), p.getSource(), p.isPrimary()));
    }

    @GetMapping("/bands/{bandId}")
    public ResponseEntity<List<org.spring.profileservice.dto.PhotoResponse>> getBandPhotos(@PathVariable Long bandId) {
        return ResponseEntity.ok(photoService.getPhotosByBand(bandId).stream()
                .map(p -> new org.spring.profileservice.dto.PhotoResponse(p.getId(), p.getSource(), p.isPrimary()))
                .toList());
    }

    @GetMapping("/venues/{venueId}")
    public ResponseEntity<List<org.spring.profileservice.dto.PhotoResponse>> getVenuePhotos(@PathVariable Long venueId) {
        return ResponseEntity.ok(photoService.getPhotosByVenue(venueId).stream()
                .map(p -> new org.spring.profileservice.dto.PhotoResponse(p.getId(), p.getSource(), p.isPrimary()))
                .toList());
    }

    @GetMapping("/organizations/{orgId}")
    public ResponseEntity<List<org.spring.profileservice.dto.PhotoResponse>> getOrgPhotos(@PathVariable Long orgId) {
        return ResponseEntity.ok(photoService.getPhotosByOrganization(orgId).stream()
                .map(p -> new org.spring.profileservice.dto.PhotoResponse(p.getId(), p.getSource(), p.isPrimary()))
                .toList());
    }

    @PatchMapping("/{photoId}/primary")
    public ResponseEntity<org.spring.profileservice.dto.PhotoResponse> setPrimaryPhoto(@PathVariable Long photoId) {
        Photo p = photoService.setPrimaryPhoto(photoId);
        return ResponseEntity.ok(new org.spring.profileservice.dto.PhotoResponse(p.getId(), p.getSource(), p.isPrimary()));
    }

    @DeleteMapping("/{photoId}")
    public ResponseEntity<Void> deletePhoto(@PathVariable Long photoId) {
        photoService.deletePhoto(photoId);
        return ResponseEntity.noContent().build();
    }
}
