package org.spring.profileservice.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.spring.profileservice.dto.PhotoRequest;
import org.spring.profileservice.dto.VenueRequest;
import org.spring.profileservice.dto.VenueResponse;
import org.spring.profileservice.entity.*;
import org.spring.profileservice.exception.CityNotFoundException;
import org.spring.profileservice.exception.DirectorNotFoundException;
import org.spring.profileservice.exception.VenueNotFoundException;
import org.spring.profileservice.mapper.VenueMapper;
import org.spring.profileservice.repository.CityRepository;
import org.spring.profileservice.repository.UserRepository;
import org.spring.profileservice.repository.VenueRepository;
import org.spring.profileservice.utility.PhotoTool;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VenueService {

    private final VenueRepository venueRepository;

    private final UserRepository userRepository;

    private final CityRepository cityRepository;

    private final VenueMapper venueMapper;

    private final PhotoTool photoTool;

    public VenueResponse createVenue(VenueRequest venueRequest) {
        User director = userRepository.findById(venueRequest.directorId())
                .orElseThrow(() -> new DirectorNotFoundException("Direttore artistico non trovato"));
        City city = cityRepository.findById(venueRequest.cityId())
                .orElseThrow(() -> new CityNotFoundException("Città non trovata"));
        Venue venue = new Venue();
        venue.setName(venueRequest.name());
        venue.setPhone(venueRequest.phone());
        venue.setCapacity(venueRequest.capacity());
        venue.setType(venueRequest.type());
        venue.setEquipment(venueRequest.equipment());
        venue.setDirector(director);

        Address address = new Address();
        address.setStreet(venueRequest.street());
        address.setHouseNumber(venueRequest.houseNumber());
        address.setZipCode(venueRequest.zipCode());
        address.setCity(city);
        venue.setAddress(address);


        Venue savedVenue = venueRepository.save(venue);
        return venueMapper.toResponse(savedVenue);

    }

    public VenueResponse updateVenue(VenueRequest venueRequest, Long venueId) {
        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() -> new VenueNotFoundException("Location non trovata"));
        User director = userRepository.findById(venueRequest.directorId())
                .orElseThrow(() -> new DirectorNotFoundException("Direttore artistico non trovato"));
        City city = cityRepository.findById(venueRequest.cityId())
                .orElseThrow(() -> new CityNotFoundException("Città non trovata"));
        venueMapper.updateVenueFromDto(venueRequest, venue);
        venueMapper.updateAddressFromDto(venueRequest, venue.getAddress());
        Venue updatedVenue = venueRepository.save(venue);
        return venueMapper.toResponse(updatedVenue);

    }

    public void deleteVenue(Long venueId) {
        if (!venueRepository.existsById(venueId)) {
            throw new VenueNotFoundException("Location non trovata");
        }
        venueRepository.deleteById(venueId);
    }

    public VenueResponse getVenueById(Long venueId) {
        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() -> new VenueNotFoundException("Location non trovata"));
        return venueMapper.toResponse(venue);
    }

    public List<VenueResponse> getAllVenue() {
        List<Venue> venues = venueRepository.findAll();
        return venues.stream()
                .map(venueMapper::toResponse)
                .toList();
    }

    @Transactional
    public void addPhotoToVenue(VenueRequest dto, Long id) {
        Venue venue = venueRepository.findById(id)
                .orElseThrow(() -> new VenueNotFoundException("Location non trovata"));

        if (dto.photos() != null) {
            for (PhotoRequest photoRequest : dto.photos()) {
                Photo photo = new Photo();
                photo.setSource(photoRequest.source());
                photo.setPrimary(photoRequest.isPrimary());
                venue.addPhoto(photo);
            }
            photoTool.validatePrimaryPhoto(venue.getPhotos());

            venueRepository.save(venue);
        }
    }

    public List<VenueResponse> searchVenuesByCity(String city) {
        List<Venue> venues = venueRepository.findByAddressCityNameIgnoreCase(city);
        if (venues.isEmpty()) {
            throw new CityNotFoundException("Nessuna location trovata per la città: " + city);
        }
        List<VenueResponse> responses = new ArrayList<>();
        for (Venue venue : venues) {
            responses.add(venueMapper.toResponse(venue));

        }
        return responses;

    }
}

