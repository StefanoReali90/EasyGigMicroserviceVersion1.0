package org.spring.profileservice.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.spring.profileservice.dto.BandFullResponse;
import org.spring.profileservice.dto.BandRegistrationRequest;
import org.spring.profileservice.entity.Band;
import org.spring.profileservice.entity.City;
import org.spring.profileservice.entity.Genre;
import org.spring.profileservice.exception.CityNotFoundException;
import org.spring.profileservice.exception.NotBlankException;
import org.spring.profileservice.mapper.BandMapper;
import org.spring.profileservice.repository.BandRepository;
import org.spring.profileservice.repository.CityRepository;
import org.spring.profileservice.repository.GenreRepository;
import org.spring.profileservice.utility.BandType;

import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BandServiceTest {

    @Mock
    private BandRepository bandRepository;
    @Mock
    private BandMapper bandMapper;
    @Mock
    private GenreRepository genreRepository;
    @Mock
    private CityRepository cityRepository;

    @InjectMocks
    private BandService bandService;

    private BandRegistrationRequest bandRequest;
    private Band band;

    @BeforeEach
    void setUp() {
        bandRequest = new BandRegistrationRequest(
                "The Rock Band",
                500, // cachet
                true, // negotiable
                BandType.ORIGINAL, // bandType
                1L, // cityId
                "http://streaming.link",
                "path/to/file",
                Collections.emptyList(), // memberIds
                Collections.singletonList(1L), // genreIds
                Collections.emptyList(), // invitationEmails
                null // photos
        );

        band = new Band();
        band.setId(1L);
        band.setName("The Rock Band");
    }

    @Test
    void addBand_Success() {
        // Arrange
        City city = new City();
        city.setId(1L);
        Genre genre = new Genre();
        genre.setId(1L);

        when(bandMapper.toEntity(bandRequest)).thenReturn(band);
        when(cityRepository.findById(1L)).thenReturn(Optional.of(city));
        when(genreRepository.findAllByIdIn(any())).thenReturn(Collections.singletonList(genre));
        when(bandRepository.save(any(Band.class))).thenReturn(band);
        when(bandMapper.toFullResponse(band)).thenReturn(new BandFullResponse(1L, "The Rock Band", 500, true, "ORIGINAL", "CityName", null, null, null, null, null));

        // Act
        BandFullResponse response = bandService.addBand(bandRequest);

        // Assert
        assertNotNull(response);
        assertEquals("The Rock Band", response.name());
        verify(bandRepository, times(1)).save(any(Band.class));
    }

    @Test
    void addBand_ThrowsException_WhenNameIsBlank() {
        // Arrange
        BandRegistrationRequest invalidRequest = new BandRegistrationRequest("", 0, false, BandType.ORIGINAL, 1L, null, null, null, null, null, null);

        // Act & Assert
        assertThrows(NotBlankException.class, () -> bandService.addBand(invalidRequest));
        verify(bandRepository, never()).save(any(Band.class));
    }

    @Test
    void addBand_ThrowsException_WhenCityNotFound() {
        // Arrange
        when(bandMapper.toEntity(bandRequest)).thenReturn(band);
        when(cityRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(CityNotFoundException.class, () -> bandService.addBand(bandRequest));
        verify(bandRepository, never()).save(any(Band.class));
    }
}
