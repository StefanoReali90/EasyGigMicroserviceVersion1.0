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
import org.spring.profileservice.exception.AccessDeniedException;

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
        if (dto.genreIds() != null && !dto.genreIds().isEmpty()) {
            List<Genre> newGenres = genreRepository.findAllByIdIn(dto.genreIds());
            // Pulizia sicura: scolleghiamo i vecchi generi aggiornando entrambi i lati della relazione
            new ArrayList<>(band.getGenres()).forEach(band::removeGenre);
            //// Associazione dei nuovi generi tramite il metodo helper
            for (Genre genre : newGenres) {
                band.addGenre(genre);
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
        Band band = bandMapper.toEntity(dto);
        populateCityAndGenres(band, dto);
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
    public List<BandMemberResponse> getBandMembers(Long id) {
        Band band = bandRepository.findById(id)
                .orElseThrow(() -> new BandNonTrovataException("Band non trovata"));

        List<Long> memberIds = band.getMembers().stream()
                .map(User::getId)
                .toList();

        return bandMapper.mapMemberIdsToResponses(memberIds);
    }

    /**
     * Consente di ricercare una band per id
     */
    public BandMemberResponse getBandMemberSummary(Long bandId, Long memberId) {
        Band band = bandRepository.findById(bandId).orElseThrow(() -> new BandNonTrovataException("Band non trovata"));
        if (!band.getMembers().contains(memberId)) {
            throw new MembroNonTrovatoException("Membro non trovato nella band");
        }
        List<BandMemberResponse> members = bandMapper.mapMemberIdsToResponses(List.of(memberId));
        if (members.isEmpty()) {
            throw new MembroNonTrovatoException("Membro non trovato");
        }
        return members.get(0);

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
        // Se arriviamo qui, l'utente è validato
    }


    }
