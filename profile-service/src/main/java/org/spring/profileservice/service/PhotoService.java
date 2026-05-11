package org.spring.profileservice.service;

import lombok.RequiredArgsConstructor;
import org.spring.profileservice.entity.Band;
import org.spring.profileservice.entity.BookingOrganization;
import org.spring.profileservice.entity.Photo;
import org.spring.profileservice.entity.Venue;
import org.spring.profileservice.repository.BandRepository;
import org.spring.profileservice.repository.BookingOrganizationRepository;
import org.spring.profileservice.repository.PhotoRepository;
import org.spring.profileservice.repository.VenueRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PhotoService {

    private final PhotoRepository photoRepository;
    private final CloudinaryService cloudinaryService;
    private final BandRepository bandRepository;
    private final VenueRepository venueRepository;
    private final BookingOrganizationRepository organizationRepository;

    public Photo uploadPhotoToBand(Long bandId, MultipartFile file, boolean isPrimary) throws IOException {
        Band band = bandRepository.findById(bandId).orElseThrow();
        List<Photo> existingPhotos = photoRepository.findByBandId(bandId);
        
        String url = cloudinaryService.uploadFile(file, "photos/bands/" + bandId);
        Photo photo = new Photo();
        photo.setName(file.getOriginalFilename());
        photo.setSource(url);
        // Se è la prima foto, rendila primaria automaticamente
        photo.setPrimary(isPrimary || existingPhotos.isEmpty());
        photo.setBand(band);
        return photoRepository.save(photo);
    }

    public Photo uploadPhotoToVenue(Long venueId, MultipartFile file, boolean isPrimary) throws IOException {
        Venue venue = venueRepository.findById(venueId).orElseThrow();
        String url = cloudinaryService.uploadFile(file, "photos/venues/" + venueId);
        Photo photo = new Photo();
        photo.setName(file.getOriginalFilename());
        photo.setSource(url);
        photo.setPrimary(isPrimary);
        photo.setVenue(venue);
        return photoRepository.save(photo);
    }

    public Photo uploadPhotoToOrganization(Long orgId, MultipartFile file, boolean isPrimary) throws IOException {
        BookingOrganization org = organizationRepository.findById(orgId).orElseThrow();
        String url = cloudinaryService.uploadFile(file, "photos/organizations/" + orgId);
        Photo photo = new Photo();
        photo.setName(file.getOriginalFilename());
        photo.setSource(url);
        photo.setPrimary(isPrimary);
        photo.setOrganization(org);
        return photoRepository.save(photo);
    }

    public List<Photo> getPhotosByBand(Long bandId) { return photoRepository.findByBandId(bandId); }
    public List<Photo> getPhotosByVenue(Long venueId) { return photoRepository.findByVenueId(venueId); }
    public List<Photo> getPhotosByOrganization(Long orgId) { return photoRepository.findByOrganizationId(orgId); }

    public void deletePhoto(Long photoId) {
        photoRepository.deleteById(photoId);
    }

    public Photo setPrimaryPhoto(Long photoId) {
        Photo photo = photoRepository.findById(photoId).orElseThrow();
        
        // Rimuovi primary dalle altre foto dello stesso proprietario
        if (photo.getBand() != null) {
            photoRepository.findByBandId(photo.getBand().getId())
                    .forEach(p -> { p.setPrimary(false); photoRepository.save(p); });
        } else if (photo.getVenue() != null) {
            photoRepository.findByVenueId(photo.getVenue().getId())
                    .forEach(p -> { p.setPrimary(false); photoRepository.save(p); });
        } else if (photo.getOrganization() != null) {
            photoRepository.findByOrganizationId(photo.getOrganization().getId())
                    .forEach(p -> { p.setPrimary(false); photoRepository.save(p); });
        }
        
        photo.setPrimary(true);
        return photoRepository.save(photo);
    }
}
