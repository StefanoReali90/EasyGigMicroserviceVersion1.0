package org.spring.profileservice.service;

import lombok.RequiredArgsConstructor;
import org.spring.profileservice.dto.*;
import org.spring.profileservice.entity.Band;
import org.spring.profileservice.entity.City;
import org.spring.profileservice.entity.Genre;
import org.spring.profileservice.entity.User;
import org.spring.profileservice.exception.BandNonTrovataException;
import org.spring.profileservice.exception.CityNotFoundException;
import org.spring.profileservice.exception.MembroNonTrovatoException;
import org.spring.profileservice.exception.NotBlankException;
import org.spring.profileservice.mapper.BandMapper;
import org.spring.profileservice.repository.BandRepository;
import org.spring.profileservice.repository.CityRepository;
import org.spring.profileservice.repository.GenreRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BandService {

    private final BandRepository bandRepository;
    private final BandMapper bandMapper;
    private final GenreRepository genreRepository;
    private final CityRepository cityRepository;

    private void populateCityAndGenres(Band band, BandRegistrationRequest dto){
        if (dto.cityId() != null) {
            City city = cityRepository.findById(dto.cityId())
                    .orElseThrow(() -> new CityNotFoundException("Città non trovata"));
            band.setCity(city);
        }

        if (dto.genreIds() != null && !dto.genreIds().isEmpty()) {
            List<Genre> genres = genreRepository.findAllByIdIn(dto.genreIds());
            band.setGenres(genres);
        }

    }

    @Transactional
    public BandFullResponse addBand(BandRegistrationRequest dto) {
        if(dto.name() == null || dto.name().isBlank()) {
            throw new NotBlankException("Il nome della band non può essere vuoto");
        }
        Band band = bandMapper.toEntity(dto);
        populateCityAndGenres(band, dto);
        bandRepository.save(band);
        return bandMapper.toFullResponse(band);
    }

    @Transactional
    public BandFullResponse updateBand(BandRegistrationRequest dto, Long id) {
        Band band = bandRepository.findById(id)
                .orElseThrow(() -> new BandNonTrovataException("Band non trovata"));

        bandMapper.updateBandFromDto(dto, band);

        populateCityAndGenres(band, dto);

        bandRepository.save(band);
        return bandMapper.toFullResponse(band);
    }
    @Transactional
    public void deleteBand(Long id) {
        if(!bandRepository.existsById(id)) {
            throw new BandNonTrovataException("Band non trovata");
        }
        bandRepository.deleteById(id);
    }

    public BandSearchResponse getBand(Long id) {
        Band band = bandRepository.findById(id).orElseThrow(() -> new BandNonTrovataException("Band non trovata"));
        return bandMapper.toSearchResponse(band);
    }

    public List<BandMemberResponse> getBandMembers(Long id) {
        Band band = bandRepository.findById(id)
                .orElseThrow(() -> new BandNonTrovataException("Band non trovata"));
        
        List<Long> memberIds = band.getMembers().stream()
                .map(User::getId)
                .toList();

        return bandMapper.mapMemberIdsToResponses(memberIds);
    }
    public BandMemberResponse getBandMemberSummary(Long bandId, Long memberId) {
        Band band = bandRepository.findById(bandId).orElseThrow(() -> new BandNonTrovataException("Band non trovata"));
        if(!band.getMembers().contains(memberId)) {
            throw new MembroNonTrovatoException("Membro non trovato nella band");
        }
        List <BandMemberResponse> members = bandMapper.mapMemberIdsToResponses(List.of(memberId));
        if (members.isEmpty()) {
            throw new MembroNonTrovatoException("Membro non trovato");
        }
        return members.get(0);

    }




}
