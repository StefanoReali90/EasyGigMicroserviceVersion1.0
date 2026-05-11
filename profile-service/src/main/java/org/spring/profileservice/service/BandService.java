package org.spring.profileservice.service;

import lombok.RequiredArgsConstructor;
import org.spring.profileservice.dto.*;
import org.spring.profileservice.entity.*;
import org.spring.profileservice.exception.*;
import org.spring.profileservice.mapper.BandMapper;
import org.spring.profileservice.repository.BandRepository;
import org.spring.profileservice.repository.CityRepository;
import org.spring.profileservice.repository.GenreRepository;
import org.spring.profileservice.repository.UserRepository;
import org.spring.profileservice.utility.PhotoTool;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor //utilizzo lombok per iniettare i repository
public class BandService {

    private final BandRepository bandRepository; //repository delle band
    private final BandMapper bandMapper; //inietto il mapper di band per gestire le risposte dto
    private final GenreRepository genreRepository; //repository dei generi musicali
    private final CityRepository cityRepository; //repository delle città
    private final UserRepository userRepository; //repository degli utenti
    private final PhotoTool photoTool;

    /**
     * Associa la città e aggiorna i generi musicali della band,
     * garantendo la coerenza delle relazioni bidirezionali.
     */
    private void populateCityAndGenres(Band band, BandRegistrationRequest dto) {
        // Gestione della città: recupero l'entità dal DB tramite l'ID fornito
        if (dto.cityId() != null) { //controllo se la città è presente nella richiesta
            City city = cityRepository.findById(dto.cityId()) //inizializzo la città pescandola dal repository
                    .orElseThrow(() -> new CityNotFoundException("Città non trovata"));// se la città non esiste sollevo un eccezione
            band.setCity(city); // se passa i controlli salvo la citta
        }
        // Gestione dei generi: sincronizzazione della relazione Many-to-Many
        if (dto.genreIds() != null) {
            List<Genre> newGenres = dto.genreIds().isEmpty() ? new ArrayList<>() : genreRepository.findAllByIdIn(dto.genreIds());
            // Pulizia sicura: scolleghiamo i vecchi generi aggiornando entrambi i lati della relazione
            new ArrayList<>(band.getGenres()).forEach(band::removeGenre);
            //// Associazione dei nuovi generi tramite il metodo helper
            for (Genre genre : newGenres) {
                band.addGenre(genre);
            }
        }


    }
    
    private void populateMembers(Band band, BandRegistrationRequest dto) {
        if (dto.memberIds() != null && !dto.memberIds().isEmpty()) {
            List<User> members = userRepository.findAllById(dto.memberIds());
            // Pulizia membri attuali (opzionale per update, necessario per coerenza)
            new ArrayList<>(band.getMembers()).forEach(band::removeUser);
            for (User member : members) {
                band.addUser(member);
            }
        }
    }


    /**
     * Consente di aggiungiere una band dopo la registrazione dell'utente
     * 1. Verifica se il nome non è vuoto
     * 2. Crea un entity Band con le informazioni
     * 3. Salva nel db le informazioni e ritorna la risposta
     */
    @Transactional
    public BandFullResponse addBand(BandRegistrationRequest dto) {
        if (dto.name() == null || dto.name().isBlank()) {
            throw new NotBlankException("Il nome della band non può essere vuoto");
        }

        // Check for uniqueness: Name + City
        if (bandRepository.existsByNameIgnoreCaseAndCityId(dto.name(), dto.cityId())) {
            throw new NotBlankException("Una band con il nome '" + dto.name() + "' esiste già in questa città.");
        }

        Band band = bandMapper.toEntity(dto);
        populateCityAndGenres(band, dto);
        populateMembers(band, dto);
        bandRepository.save(band);
        return bandMapper.toFullResponse(band);
    }

    /**
     * Consente di aggiornare una band tramite id
     * 1. Verifica se l'id esiste
     * 2. Salva nel db le informazioni e ritorna la risposta
     */
    @Transactional
    public BandFullResponse updateBand(BandRegistrationRequest dto, Long id) {
        Band band = bandRepository.findById(id)
                .orElseThrow(() -> new BandNonTrovataException("Band non trovata"));

        bandMapper.updateBandFromDto(dto, band);

        if (dto.photos() != null) {
            band.getPhotos().clear();
            for (PhotoRequest photoRequest : dto.photos()) {
                Photo photo = new Photo();
                photo.setSource(photoRequest.source());
                photo.setPrimary(photoRequest.isPrimary());
                band.addPhoto(photo);
            }
            photoTool.validatePrimaryPhoto(band.getPhotos());
        }

        populateCityAndGenres(band, dto);
        populateMembers(band, dto);

        bandRepository.save(band);
        return bandMapper.toFullResponse(band);
    }

    /**
     * Consente di cancellare una band tramite id
     * 1. Verifica se l'id esiste
     * 3. Cancella dal db la band
     */
    @Transactional
    public void deleteBand(Long id) {
        if (!bandRepository.existsById(id)) {
            throw new BandNonTrovataException("Band non trovata");
        }
        bandRepository.deleteById(id);
    }

    /**
     * Consente di ricercare una band per id
     */
    public BandSearchResponse getBand(Long id) {
        Band band = bandRepository.findById(id).orElseThrow(() -> new BandNonTrovataException("Band non trovata"));
        return bandMapper.toSearchResponse(band);
    }

    /**
     * Consente di ricercare una band con l'id di uno dei membri
     */
    public List<MemberSummaryResponse> getBandMembers(Long id) {
        Band band = bandRepository.findById(id)
                .orElseThrow(() -> new BandNonTrovataException("Band non trovata"));

        return bandMapper.mapMembersToResponses(band.getMembers());
    }

    /**
     * Consente di ricercare una band per id
     */
    public MemberSummaryResponse getBandMemberSummary(Long bandId, Long memberId) {
        Band band = bandRepository.findById(bandId).orElseThrow(() -> new BandNonTrovataException("Band non trovata"));
        User member = band.getMembers().stream()
                .filter(m -> m.getId().equals(memberId))
                .findFirst()
                .orElseThrow(() -> new MembroNonTrovatoException("Membro non trovato nella band"));

        return new MemberSummaryResponse(member.getId(), member.getFirstName(), member.getLastName(), member.getRole().toString());
    }
    /**
     * Consente aggiungere un membro alla band
     */
    @Transactional
    public void addBandMember(Long bandId, Long memberId, Long userId) {// metodo per aggiungere un membro di una band tramite id
        validateUser(userId,bandId);
        Band band = bandRepository.findById(bandId).orElseThrow(() -> new BandNonTrovataException("Band non trovata"));
        User user = userRepository.findById(memberId).orElseThrow(() -> new UserNotFoundException(("Utente non trovato")));
        band.addUser(user);
        bandRepository.save(band);
    }
    /**
     * Consente di rimuovere un membro dalla band
     */

    @Transactional
    public void removeBandMember(Long bandId, Long memberId,Long userId) { //metodo per rimuovere un membro di una band tramite id
        validateUser(userId,bandId);
        Band band = bandRepository.findById(bandId).orElseThrow(() -> new BandNonTrovataException("Band non trovata"));
        User user = userRepository.findById(memberId).orElseThrow(() -> new UserNotFoundException(("Utente non trovato")));
        band.removeUser(user);
        bandRepository.save(band);
        if (band.getMembers().isEmpty()){
            bandRepository.delete(band);
        }
    }

    public void validateUser(Long userId, Long bandId) {
        // Cerco l'utente e la band. Se non esistono, lancio subito l'eccezione.
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User non trovato"));

        Band band = bandRepository.findById(bandId)
                .orElseThrow(() -> new BandNonTrovataException("Band non trovata"));

        // Verifico l'appartenenza
        if (!band.getMembers().contains(user)) {
            throw new AccessDeniedException("Accesso non autorizzato: non sei un membro di questa band");
        }

    }

    public List<BandSearchResponse> searchBands(String name, String cityName, String genreName, Double minReputation, Integer maxCachet) {
        List<Band> bands;
        double minRep = minReputation != null ? minReputation : 0.0;
        int maxCash = maxCachet != null ? maxCachet : Integer.MAX_VALUE;

        boolean hasName = name != null && !name.isBlank();
        boolean hasCity = cityName != null && !cityName.isBlank();

        if (hasName && hasCity) {
            bands = bandRepository.findByNameContainingIgnoreCaseAndCityNameIgnoreCaseAndCachetLessThanEqualAndReputationGreaterThanEqual(name, cityName, maxCash, minRep);
        } else if (hasName) {
            bands = bandRepository.findByNameContainingIgnoreCaseAndCachetLessThanEqualAndReputationGreaterThanEqual(name, maxCash, minRep);
        } else if (hasCity) {
            bands = bandRepository.findByCityNameIgnoreCaseAndCachetLessThanEqualAndReputationGreaterThanEqual(cityName, maxCash, minRep);
        } else {
            bands = bandRepository.findByCachetLessThanEqualAndReputationGreaterThanEqual(maxCash, minRep);
        }

        // Genre filter (performed in memory for simplicity or via repo if requested)
        if (genreName != null && !genreName.isBlank()) {
            bands = bands.stream()
                    .filter(b -> b.getGenres().stream().anyMatch(g -> g.getName().equalsIgnoreCase(genreName)))
                    .toList();
        }

        return bands.stream()
                .map(bandMapper::toSearchResponse)
                .toList();
    }

    public List<BandSearchResponse> getBandsByUser(Long userId) {
        return bandRepository.findByMembersId(userId).stream()
                .map(bandMapper::toSearchResponse)
                .toList();
    }
}
