package org.spring.bookingservice.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.spring.bookingservice.dto.CalendarResponseDTO;
import org.spring.bookingservice.dto.CreateSlotRequestDTO;
import org.spring.bookingservice.dto.SlotResponseDTO;
import org.spring.bookingservice.entity.Slot;
import org.spring.bookingservice.mapper.SlotMapper;
import org.spring.bookingservice.repository.SlotRepository;
import org.spring.bookingservice.utility.SlotState;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SlotServiceTest {

    @Mock
    private SlotRepository slotRepository;
    @Mock
    private SlotMapper slotMapper;

    @InjectMocks
    private SlotService slotService;

    @Test
    void createSlot_Success() {
        // Arrange
        LocalDateTime start = LocalDateTime.now().plusDays(1);
        LocalDateTime end = start.plusHours(2);
        CreateSlotRequestDTO requestDTO = new CreateSlotRequestDTO(1L, start, end);
        
        Slot slot = new Slot();
        slot.setId(1L);
        slot.setVenueId(1L);
        slot.setStart(start);
        slot.setEnd(end);
        slot.setState(SlotState.AVAILABLE);

        when(slotMapper.toSlotResponseDTO(any(Slot.class))).thenReturn(new SlotResponseDTO(1L, start, end, SlotState.AVAILABLE, 1L));

        // Act
        SlotResponseDTO response = slotService.createSlot(requestDTO);

        // Assert
        assertNotNull(response);
        assertEquals(SlotState.AVAILABLE, response.state());
        verify(slotRepository, times(1)).save(any(Slot.class));
    }

    @Test
    void getCalendarAvailability_Success() {
        // Arrange
        Long venueId = 1L;
        int month = 5;
        int year = 2026;
        LocalDateTime start = LocalDateTime.of(2026, 5, 15, 20, 0);
        
        Slot slot = new Slot();
        slot.setStart(start);
        slot.setState(SlotState.AVAILABLE);
        
        when(slotRepository.findByVenueIdAndStartBetween(any(), any(), any())).thenReturn(Collections.singletonList(slot));

        // Act
        CalendarResponseDTO response = slotService.getCalendarAvailability(venueId, month, year);

        // Assert
        assertNotNull(response);
        Map<java.time.LocalDate, String> colors = response.availabilityMap();
        assertEquals("green", colors.get(start.toLocalDate()));
    }
}
