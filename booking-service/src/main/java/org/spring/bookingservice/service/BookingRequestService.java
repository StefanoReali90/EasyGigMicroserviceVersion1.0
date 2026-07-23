package org.spring.bookingservice.service;

import lombok.RequiredArgsConstructor;
import org.spring.bookingservice.dto.*;
import org.spring.bookingservice.entity.BookingRequest;
import org.spring.bookingservice.entity.Slot;
import org.spring.bookingservice.exception.*;
import org.spring.bookingservice.mapper.BookingMapper;
import org.spring.bookingservice.repository.BookingRequestRepository;
import org.spring.bookingservice.repository.SlotRepository;
import org.spring.bookingservice.utility.BookingSlotState;
import org.spring.bookingservice.utility.RequesterType;
import org.spring.bookingservice.utility.SlotState;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Servizio core per la gestione del ciclo di vita delle prenotazioni (Booking).
 * Implementa la logica di business per la creazione, accettazione, rifiuto e cancellazione 
 * delle richieste, gestendo la consistenza degli stati degli Slot.
 */
@Service
@RequiredArgsConstructor
public class BookingRequestService {

    private final BookingRequestRepository bookingRequestRepository;
    private final SlotRepository slotRepository;
    private final BookingMapper bookingMapper;
    
    /**
     * Producer Kafka per il disaccoppiamento degli eventi di booking verso 
     * il sistema di messaggistica (Chat) e notifiche.
     */
    private final BookingProducer bookingProducer;

    public BookingResponse createRequest(BookingRequestDTO bookingRequestDTO) {
        Long userId = bookingRequestDTO.userId();
        Long slotId = bookingRequestDTO.slotId();
        Slot slot = slotRepository.findById(slotId).orElseThrow(() -> new SlotNotFoundException("Slot non trovato"));
        if (slot.getState() == SlotState.BOOKED) {
            throw new SlotAlredyBookedException("Questo Slot non è più disponbiile");
        }
        if (LocalDateTime.now().isAfter(slot.getStart().minusDays(2))) {
            throw new BookingNotAllowedException("Prenotazione non consentita: mancano meno di 48 ore all'inizio dell'evento");
        }
        BookingRequest bookingRequest = new BookingRequest();
        bookingRequest.setUserId(userId);
        bookingRequest.setSlot(slot);
        bookingRequest.setVenueId(slot.getVenueId());
        slot.setState(SlotState.PENDING);
        slotRepository.save(slot);

        BookingRequest savedRequest = bookingRequestRepository.save(bookingRequest);
        
        // Notifica al locale dell'arrivo di una nuova richiesta
        bookingProducer.sendRequestCreatedEvent(new BookingRequestCreatedEvent(
                savedRequest.getId(),
                savedRequest.getUserId(),
                savedRequest.getVenueId(),
                slot.getStart().toString()
        ));

        return bookingMapper.toBookingResponse(savedRequest);
    }

    /**
     * Valida e accetta una richiesta di prenotazione.
     * Transiziona lo stato dello slot a BOOKED e rigetta automaticamente tutte le altre 
     * richieste pendenti per lo stesso slot per garantire la consistenza del calendario.
     */
    public BookingResponse acceptRequest(Long userId, Long bookingRequestId) {
        BookingRequest bookingRequest = bookingRequestRepository.findById(bookingRequestId).orElseThrow(() -> new BookingRequestNotFound("Booking Request non trovato"));
        Slot slot = bookingRequest.getSlot();
        
        // Verifica autorizzazione: l'utente deve essere il direttore che ha creato lo slot
        if (slot.getDirectorId() != null && !slot.getDirectorId().equals(userId)) {
            throw new SlotNotBeCancelledException("Non sei autorizzato ad accettare prenotazioni per questo locale");
        }
        
        // Verifica disponibilità dello slot per prevenire double-booking
        if (bookingRequest.getStatus() != BookingSlotState.PENDING && slot.getState() == SlotState.BOOKED) {
            throw new SlotAlredyBookedException("Questo Slot è stato già accettato");
        }
        
        bookingRequest.setStatus(BookingSlotState.ACCEPTED);
        slot.setState(SlotState.BOOKED);
        slotRepository.save(slot);

        // Chiusura massiva delle altre richieste concorrenti
        List<BookingRequest> otherRequests = bookingRequestRepository.findBySlotIdAndStatusAndIdNot(slot.getId(), BookingSlotState.PENDING, bookingRequestId);
        for (BookingRequest other : otherRequests) {
            other.setStatus(BookingSlotState.REJECTED);
        }
        bookingRequestRepository.saveAll(otherRequests);

        BookingRequest savedRequest = bookingRequestRepository.save(bookingRequest);
        
        // Propagazione evento tramite Kafka per i servizi a valle (Chat/Notification)
        BookingAcceptedEvent event = new BookingAcceptedEvent(
                savedRequest.getId(),
                savedRequest.getUserId(),
                slot.getVenueId()
        );
        bookingProducer.sendAcceptedEvent(event);
        return bookingMapper.toBookingResponse(savedRequest);
    }

    public BookingResponse cancelRequestByUser(Long userId, Long bookingRequestId, String reason) {
        BookingRequest bookingRequest = bookingRequestRepository.findById(bookingRequestId).orElseThrow(() -> new BookingRequestNotFound("Booking Request non trovato"));
        if (!bookingRequest.getUserId().equals(userId)) {
            throw new SlotNotBeCancelledException("Non puoi cancellare questa prenotazione, non sei autorizzato");
        }
        
        String previousStatus = bookingRequest.getStatus().toString();
        Slot slot = bookingRequest.getSlot();
        LocalDateTime dataAttuale = LocalDateTime.now();
        boolean isLateCancellation = dataAttuale.isAfter(slot.getStart().minusDays(2));

        if (isLateCancellation) {
            throw new SlotNotBeCancelledException("Non puoi cancellare l'evento a meno di 48 ore dall'inizio. Contatta direttamente il Direttore Artistico del locale.");
        }

        bookingRequest.setStatus(BookingSlotState.CANCELED);
        if (slot.getState() == SlotState.BOOKED) {
            slot.setState(SlotState.AVAILABLE);
        } else {
            int otherRequestInPending = bookingRequestRepository.countBySlotIdAndStatusAndIdNot(slot.getId(), BookingSlotState.PENDING, bookingRequestId);
            slot.setState(otherRequestInPending == 0 ? SlotState.AVAILABLE : SlotState.PENDING);
        }
        
        bookingRequest.setCancellationReason(reason);
        slotRepository.save(slot);
        bookingRequestRepository.save(bookingRequest);
        
        BookingCanceledEvent event = new BookingCanceledEvent(
                bookingRequest.getId(),
                bookingRequest.getUserId(),
                slot.getId(),
                bookingRequest.getVenueId(),
                "USER",
                reason,
                previousStatus,
                false // L'evento ora scatta solo se >= 48h (nessuno strike all'artista)
        );
        bookingProducer.sendCanceledEvent(event);
        return bookingMapper.toBookingResponse(bookingRequest);
    }

    public BookingResponse cancelRequestByVenue(Long userId, Long bookingRequestId, String reason) {
        BookingRequest bookingRequest = bookingRequestRepository.findById(bookingRequestId).orElseThrow(() -> new BookingRequestNotFound("Booking Request non trovato"));
        Slot slot = bookingRequest.getSlot();
        if (!bookingRequest.getVenueId().equals(userId) && (slot.getDirectorId() == null || !slot.getDirectorId().equals(userId))) {
            throw new SlotNotBeCancelledException("Non puoi cancellare questa prenotazione, non sei autorizzato");
        }
        
        String previousStatus = bookingRequest.getStatus().toString();
        LocalDateTime dataAttuale = LocalDateTime.now();
        boolean isLateCancellation = dataAttuale.isAfter(slot.getStart().minusDays(2));

        bookingRequest.setStatus(BookingSlotState.CANCELED);
        if (slot.getState() == SlotState.BOOKED) {
            slot.setState(SlotState.AVAILABLE);
        } else {
            int otherRequestInPending = bookingRequestRepository.countBySlotIdAndStatusAndIdNot(slot.getId(), BookingSlotState.PENDING, bookingRequestId);
            slot.setState(otherRequestInPending == 0 ? SlotState.AVAILABLE : SlotState.PENDING);
        }
        
        bookingRequest.setCancellationReason(reason);
        slotRepository.save(slot);
        bookingRequestRepository.save(bookingRequest);
        
        BookingCanceledEvent event = new BookingCanceledEvent(
                bookingRequest.getId(),
                bookingRequest.getUserId(),
                slot.getId(),
                bookingRequest.getVenueId(),
                "VENUE",
                reason,
                previousStatus,
                isLateCancellation
        );
        bookingProducer.sendCanceledEvent(event);
        return bookingMapper.toBookingResponse(bookingRequest);
    }

    public BookingResponse rejectRequest(Long userId, Long bookingRequestId) {
        BookingRequest bookingRequest = bookingRequestRepository
                .findById(bookingRequestId)
                .orElseThrow(() -> new BookingRequestNotFound("Booking Request non trovato"));
        Slot slot = bookingRequest.getSlot();

        if (slot.getDirectorId() != null && !slot.getDirectorId().equals(userId)) {
            throw new SlotNotBeCancelledException("Non sei autorizzato a rifiutare prenotazioni per questo locale");
        }

        if (bookingRequest.getStatus() != BookingSlotState.PENDING) {
            throw new SlotNotBeCancelledException("Questa prenotazione non è più in attesa di risposta");
        }
        bookingRequest.setStatus(BookingSlotState.REJECTED);
        int otherPending = bookingRequestRepository.countBySlotIdAndStatusAndIdNot(slot.getId(), BookingSlotState.PENDING, bookingRequestId);

        slot.setState(otherPending == 0 ? SlotState.AVAILABLE : SlotState.PENDING);
        slotRepository.save(slot);
        bookingRequestRepository.save(bookingRequest);

        // Notifica all'artista del rifiuto
        bookingProducer.sendRejectedEvent(new BookingRejectedEvent(
                bookingRequest.getId(),
                bookingRequest.getUserId(),
                bookingRequest.getVenueId()
        ));

        return bookingMapper.toBookingResponse(bookingRequest);
    }

    public List<BookingResponse> createPromoterBooking(CreatePromoterBookingDTO createPromoterBookingDTO) {
        Long promoterId = createPromoterBookingDTO.promoterId();
        Long venueId = createPromoterBookingDTO.venueId();
        List<Long> slotIds = createPromoterBookingDTO.slotIds();
        List<Long> bandIds = createPromoterBookingDTO.bandIds();

        if (slotIds.size() != bandIds.size()) {
            throw new BookingNotAllowedException("Il numero di slot e band deve essere lo stesso");
        }
        String groupId = UUID.randomUUID().toString();
        List<BookingRequest> savedRequests = new ArrayList<>();

        for (int i = 0; i < slotIds.size(); i++) {
            Slot slot = slotRepository.findById(slotIds.get(i))
                    .orElseThrow(() -> new SlotNotFoundException("Slot non trovato"));
            if (slot.getState() == SlotState.BOOKED) {
                throw new SlotAlredyBookedException("Slot " + slot.getId() + " non è disponibile");
            }
            if (LocalDateTime.now().isAfter(slot.getStart().minusDays(2))) {
                throw new BookingNotAllowedException("Slot " + slot.getId() + " non può essere prenotato, tempo massimo superato");
            }
            BookingRequest bookingRequest = new BookingRequest();
            bookingRequest.setUserId(promoterId);
            bookingRequest.setSlot(slot);
            bookingRequest.setVenueId(venueId);
            bookingRequest.setBandId(bandIds.get(i));
            bookingRequest.setGroupId(groupId);
            bookingRequest.setRequesterType(RequesterType.PROMOTER);
            slot.setState(SlotState.PENDING);
            slotRepository.save(slot);
            savedRequests.add(bookingRequestRepository.save(bookingRequest));

        }
        return savedRequests.stream()
                .map(bookingMapper::toBookingResponse)
                .toList();

    }

    public BookingResponse assignBandToSlot(Long bookingRequestId, org.spring.bookingservice.dto.AssignBandToSlotDTO dto) {
        BookingRequest bookingRequest = bookingRequestRepository.findById(bookingRequestId)
                .orElseThrow(() -> new BookingRequestNotFound("Booking Request non trovato"));

        if (!bookingRequest.getUserId().equals(dto.promoterId())) {
            throw new BookingNotAllowedException("Non sei autorizzato a modificare questa prenotazione");
        }

        if (bookingRequest.getStatus() != BookingSlotState.PENDING && bookingRequest.getStatus() != BookingSlotState.ACCEPTED) {
            throw new BookingNotAllowedException("Impossibile modificare una prenotazione in stato " + bookingRequest.getStatus());
        }

        bookingRequest.setBandId(dto.bandId());
        BookingRequest savedRequest = bookingRequestRepository.save(bookingRequest);
        return bookingMapper.toBookingResponse(savedRequest);
    }

    public List<BookingResponse> getRequestsByVenue(Long venueId, BookingSlotState status) {
        return bookingRequestRepository.findByVenueIdAndStatus(venueId, status).stream()
                .map(bookingMapper::toBookingResponse)
                .toList();
    }

    public BookingResponse inviteArtist(Long venueId, Long artistId, Long slotId) {
        Slot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new SlotNotFoundException("Slot non trovato"));
        
        if (!slot.getVenueId().equals(venueId)) {
            throw new BookingNotAllowedException("Non puoi invitare per questo slot");
        }
        
        if (slot.getState() == SlotState.BOOKED) {
            throw new SlotAlredyBookedException("Slot non disponibile");
        }

        BookingRequest bookingRequest = new BookingRequest();
        bookingRequest.setUserId(artistId); // L'invitato
        bookingRequest.setSlot(slot);
        bookingRequest.setVenueId(venueId);
        bookingRequest.setRequesterType(RequesterType.VENUE);
        bookingRequest.setStatus(BookingSlotState.INVITED);
        
        slot.setState(SlotState.PENDING);
        slotRepository.save(slot);
        
        return bookingMapper.toBookingResponse(bookingRequestRepository.save(bookingRequest));
    }

    public List<BookingResponse> getRequestsByUser(Long userId) {
        return bookingRequestRepository.findByUserId(userId).stream()
                .map(bookingMapper::toBookingResponse)
                .toList();
    }
}