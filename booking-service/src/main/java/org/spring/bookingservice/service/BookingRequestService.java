package org.spring.bookingservice.service;

import lombok.RequiredArgsConstructor;
import org.spring.bookingservice.dto.BookingCanceledEvent;
import org.spring.bookingservice.dto.BookingResponse;
import org.spring.bookingservice.entity.BookingRequest;
import org.spring.bookingservice.entity.Slot;
import org.spring.bookingservice.exception.BookingRequestNotFound;
import org.spring.bookingservice.exception.SlotNotBeCancelledException;
import org.spring.bookingservice.mapper.BookingMapper;
import org.spring.bookingservice.exception.SlotAlredyBookedException;
import org.spring.bookingservice.exception.SlotNotFoundException;
import org.spring.bookingservice.repository.BookingRequestRepository;
import org.spring.bookingservice.repository.SlotRepository;
import org.spring.bookingservice.utility.BookingSlotState;
import org.spring.bookingservice.utility.SlotState;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingRequestService {

    private final BookingRequestRepository bookingRequestRepository;
    private final SlotRepository slotRepository;
    private final BookingMapper bookingMapper;
    private final BookingProducer bookingProducer;

    public BookingResponse createRequest(Long userId, Long slotId) {
        Slot slot = slotRepository.findById(slotId).orElseThrow(() -> new SlotNotFoundException("Slot non trovato"));
        if (slot.getState() == SlotState.BOOKED) {
            throw new SlotAlredyBookedException("Questo Slot non è più disponbiile");
        }
        BookingRequest bookingRequest = new BookingRequest();
        bookingRequest.setUserId(userId);
        bookingRequest.setSlot(slot);
        bookingRequest.setVenueId(slot.getVenueId());
        slot.setState(SlotState.PENDING);
        slotRepository.save(slot);

        BookingRequest savedRequest = bookingRequestRepository.save(bookingRequest);
        return bookingMapper.toBookingResponse(savedRequest);
    }

    public BookingResponse acceptRequest(Long userId, Long bookingRequestId) {
        BookingRequest bookingRequest = bookingRequestRepository.findById(bookingRequestId).orElseThrow(() -> new BookingRequestNotFound("Booking Request non trovato"));
        Slot slot = bookingRequest.getSlot();
        if (bookingRequest.getStatus() != BookingSlotState.PENDING && slot.getState() == SlotState.BOOKED) {
            throw new SlotAlredyBookedException("Questo Slot è stato già accettato");
        }
        bookingRequest.setStatus(BookingSlotState.ACCEPTED);
        slot.setState(SlotState.BOOKED);
        slotRepository.save(slot);
        
        List<BookingRequest> otherRequests = bookingRequestRepository.findBySlotIdAndStatusAndIdNot(slot.getId(), BookingSlotState.PENDING, bookingRequestId);
        for (BookingRequest other : otherRequests) {
            other.setStatus(BookingSlotState.REJECTED);
        }
        bookingRequestRepository.saveAll(otherRequests);

        BookingRequest savedRequest = bookingRequestRepository.save(bookingRequest);
        return bookingMapper.toBookingResponse(savedRequest);
    }

    public BookingResponse cancelRequestByUser(Long userId, Long bookingRequestId, String reason) {
        BookingRequest bookingRequest = bookingRequestRepository.findById(bookingRequestId).orElseThrow(() -> new BookingRequestNotFound("Booking Request non trovato"));
        if (!bookingRequest.getUserId().equals(userId)) {
            throw new SlotNotBeCancelledException("Non puoi cancellare questa prenotazione, non sei autorizzato");
        }
        Slot slot = bookingRequest.getSlot();
        LocalDateTime dataAttuale = LocalDateTime.now();
        if (dataAttuale.isAfter(slot.getStart().minusDays(2))){
            throw new SlotNotBeCancelledException("Non puoi cancellare questa prenotazione, tempo massimo superato");
        }
        bookingRequest.setStatus(BookingSlotState.CANCELED);
        if (slot.getState() == SlotState.BOOKED) {
            slot.setState(SlotState.AVAILABLE);

        }else{
            int otherRequestInPending = bookingRequestRepository.countBySlotIdAndStatusAndIdNot(slot.getId(), BookingSlotState.PENDING, bookingRequestId);
            if(otherRequestInPending == 0){
                slot.setState(SlotState.AVAILABLE);
            }else{
                slot.setState(SlotState.PENDING);
            }
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
                reason
        );
        bookingProducer.sendCanceledEvent(event);
        return bookingMapper.toBookingResponse(bookingRequest);
    }

    public BookingResponse cancelRequestByVenue(Long userId, Long bookingRequestId, String reason) {
        BookingRequest bookingRequest = bookingRequestRepository.findById(bookingRequestId).orElseThrow(() -> new BookingRequestNotFound("Booking Request non trovato"));
        if (!bookingRequest.getVenueId().equals(userId)) {
            throw new SlotNotBeCancelledException("Non puoi cancellare questa prenotazione, non sei autorizzato");
        }
        Slot slot = bookingRequest.getSlot();
        bookingRequest.setStatus(BookingSlotState.CANCELED);
        if (slot.getState() == SlotState.BOOKED) {
            slot.setState(SlotState.AVAILABLE);
        }else{
            int otherRequestInPending = bookingRequestRepository.countBySlotIdAndStatusAndIdNot(slot.getId(), BookingSlotState.PENDING, bookingRequestId);
            if(otherRequestInPending == 0){
                slot.setState(SlotState.AVAILABLE);
            }else{
                slot.setState(SlotState.PENDING);
            }
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
                reason
        );
        bookingProducer.sendCanceledEvent(event);
        return bookingMapper.toBookingResponse(bookingRequest);
    }
}
