package org.spring.profileservice.service;

import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.spring.profileservice.dto.BandFullResponse;
import org.spring.profileservice.dto.BandRegistrationRequest;
import org.spring.profileservice.entity.Band;
import org.spring.profileservice.exception.BandNonTrovataException;
import org.spring.profileservice.exception.NotBlankException;
import org.spring.profileservice.mapper.BandMapper;
import org.spring.profileservice.repository.BandRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class BandService {

    private final BandRepository bandRepository;
    private final BandMapper bandMapper;

    @Transactional
    public BandFullResponse addBand(BandRegistrationRequest dto) {
        if(dto.name() == null || dto.name().isBlank()) {
            throw new NotBlankException("Il nome della band non può essere vuoto");
        }
        Band band = bandMapper.toEntity(dto);
        bandRepository.save(band);
        return bandMapper.toFullResponse(band);
    }

    @Transactional
    public BandFullResponse updateBand(BandRegistrationRequest dto, Long id) {
        if(!bandRepository.existsById(id)) {
            throw new BandNonTrovataException("Band non trovata");

        }
        Band band = bandMapper.toEntity(dto);
        bandRepository.save(band);
        return bandMapper.toFullResponse(band);
    }

    public void deleteBand(Long id) {
        if(!bandRepository.existsById(id)) {
            throw new BandNonTrovataException("Band non trovata");
        }
        bandRepository.deleteById(id);
    }


}
