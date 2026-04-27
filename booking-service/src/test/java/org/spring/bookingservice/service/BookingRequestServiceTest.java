package org.spring.bookingservice.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.spring.bookingservice.dto.BookingRequestDTO;
import org.spring.bookingservice.dto.BookingResponse;
import org.spring.bookingservice.entity.BookingRequest;
import org.spring.bookingservice.entity.Slot;
import org.spring.bookingservice.exception.BookingNotAllowedException;
import org.spring.bookingservice.exception.SlotAlredyBookedException;
import org.spring.bookingservice.mapper.BookingMapper;
import org.spring.bookingservice.repository.BookingRequestRepository;
import org.spring.bookingservice.repository.SlotRepository;
import org.spring.bookingservice.utility.BookingSlotState;
import org.spring.bookingservice.utility.SlotState;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookingRequestServiceTest {

    @Mock
    private BookingRequestRepository bookingRequestRepository;
    @Mock
    private SlotRepository slotRepository;
    @Mock
    private BookingMapper bookingMapper;
    @Mock
    private BookingProducer bookingProducer;

    @InjectMocks
    private BookingRequestService bookingRequestService;

    private Slot slot;
    private BookingRequestDTO requestDTO;
    private BookingRequest bookingRequest;

    @BeforeEach
    void setUp() {
        slot = new Slot();
        slot.setId(1L);
        slot.setVenueId(10L);
        slot.setStart(LocalDateTime.now().plusDays(5));
        slot.setEnd(LocalDateTime.now().plusDays(5).plusHours(2));
        slot.setState(SlotState.AVAILABLE);

        requestDTO = new BookingRequestDTO(1L, 1L);

        bookingRequest = new BookingRequest();
        bookingRequest.setId(100L);
        bookingRequest.setUserId(1L);
        bookingRequest.setSlot(slot);
        bookingRequest.setVenueId(10L);
        bookingRequest.setStatus(BookingSlotState.PENDING);
    }

    @Test
    void createRequest_Success() {
        when(slotRepository.findById(1L)).thenReturn(Optional.of(slot));
        when(bookingRequestRepository.save(any(BookingRequest.class))).thenReturn(bookingRequest);
        when(bookingMapper.toBookingResponse(any(BookingRequest.class)))
                .thenReturn(new BookingResponse(100L, 1L, 1L, 10L, BookingSlotState.PENDING, LocalDateTime.now(), null, null, null));

        BookingResponse response = bookingRequestService.createRequest(requestDTO);

        assertNotNull(response);
        assertEquals(BookingSlotState.PENDING, response.status());
        verify(slotRepository).save(slot);
        assertEquals(SlotState.PENDING, slot.getState());
    }

    @Test
    void createRequest_ThrowsException_WhenSlotAlreadyBooked() {
        slot.setState(SlotState.BOOKED);
        when(slotRepository.findById(1L)).thenReturn(Optional.of(slot));

        assertThrows(SlotAlredyBookedException.class, () -> bookingRequestService.createRequest(requestDTO));
    }

    @Test
    void createRequest_ThrowsException_WhenLessThen48Hours() {
        slot.setStart(LocalDateTime.now().plusHours(24));
        when(slotRepository.findById(1L)).thenReturn(Optional.of(slot));

        assertThrows(BookingNotAllowedException.class, () -> bookingRequestService.createRequest(requestDTO));
    }

    @Test
    void acceptRequest_Success() {
        when(bookingRequestRepository.findById(100L)).thenReturn(Optional.of(bookingRequest));
        when(bookingRequestRepository.save(any(BookingRequest.class))).thenReturn(bookingRequest);
        when(bookingMapper.toBookingResponse(any(BookingRequest.class)))
                .thenReturn(new BookingResponse(100L, 1L, 1L, 10L, BookingSlotState.ACCEPTED, LocalDateTime.now(), null, null, null));

        BookingResponse response = bookingRequestService.acceptRequest(10L, 100L);

        assertNotNull(response);
        assertEquals(BookingSlotState.ACCEPTED, bookingRequest.getStatus());
        assertEquals(SlotState.BOOKED, slot.getState());
        verify(slotRepository).save(slot);
    }

    @Test
    void cancelRequestByUser_Success() {
        bookingRequest.setStatus(BookingSlotState.ACCEPTED);
        slot.setState(SlotState.BOOKED);
        
        when(bookingRequestRepository.findById(100L)).thenReturn(Optional.of(bookingRequest));
        when(bookingMapper.toBookingResponse(any(BookingRequest.class)))
                .thenReturn(new BookingResponse(100L, 1L, 1L, 10L, BookingSlotState.CANCELED, LocalDateTime.now(), null, null, null));

        BookingResponse response = bookingRequestService.cancelRequestByUser(1L, 100L, "Personal reasons");

        assertNotNull(response);
        assertEquals(BookingSlotState.CANCELED, bookingRequest.getStatus());
        assertEquals(SlotState.AVAILABLE, slot.getState());
        verify(bookingProducer).sendCanceledEvent(any());
    }
}
