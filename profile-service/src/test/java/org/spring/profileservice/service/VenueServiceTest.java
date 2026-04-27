package org.spring.profileservice.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.spring.profileservice.dto.VenueRequest;
import org.spring.profileservice.dto.VenueResponse;
import org.spring.profileservice.entity.City;
import org.spring.profileservice.entity.User;
import org.spring.profileservice.entity.Venue;
import org.spring.profileservice.exception.CityNotFoundException;
import org.spring.profileservice.exception.DirectorNotFoundException;
import org.spring.profileservice.mapper.VenueMapper;
import org.spring.profileservice.repository.CityRepository;
import org.spring.profileservice.repository.UserRepository;
import org.spring.profileservice.repository.VenueRepository;
import org.spring.profileservice.utility.VenueType;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VenueServiceTest {

    @Mock
    private VenueRepository venueRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private CityRepository cityRepository;
    @Mock
    private VenueMapper venueMapper;

    @InjectMocks
    private VenueService venueService;

    private VenueRequest venueRequest;
    private User director;
    private City city;

    @BeforeEach
    void setUp() {
        venueRequest = new VenueRequest(
                "Jazz Club",
                "123456789",
                100,
                VenueType.MIXED,
                "Full Equipment",
                1L, // directorId
                "Main Street",
                "10",
                "00100",
                1L, // cityId
                null // photos
        );

        director = new User();
        director.setId(1L);

        city = new City();
        city.setId(1L);
    }

    @Test
    void createVenue_Success() {
        // Arrange
        when(userRepository.findById(1L)).thenReturn(Optional.of(director));
        when(cityRepository.findById(1L)).thenReturn(Optional.of(city));
        when(venueRepository.save(any(Venue.class))).thenAnswer(invocation -> {
            Venue v = invocation.getArgument(0);
            v.setId(1L);
            return v;
        });
        when(venueMapper.toResponse(any(Venue.class))).thenReturn(new VenueResponse(1L, "Jazz Club", "123456789", 100, VenueType.MIXED, "Full Equipment", "Director Name", "Main Street 10", "CityName", null));

        // Act
        VenueResponse response = venueService.createVenue(venueRequest);

        // Assert
        assertNotNull(response);
        assertEquals("Jazz Club", response.name());
        verify(venueRepository, times(1)).save(any(Venue.class));
    }

    @Test
    void createVenue_ThrowsException_WhenDirectorNotFound() {
        // Arrange
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(DirectorNotFoundException.class, () -> venueService.createVenue(venueRequest));
        verify(venueRepository, never()).save(any(Venue.class));
    }

    @Test
    void createVenue_ThrowsException_WhenCityNotFound() {
        // Arrange
        when(userRepository.findById(1L)).thenReturn(Optional.of(director));
        when(cityRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(CityNotFoundException.class, () -> venueService.createVenue(venueRequest));
        verify(venueRepository, never()).save(any(Venue.class));
    }
}
