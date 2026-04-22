package org.spring.bookingservice.controller;

import lombok.RequiredArgsConstructor;
import org.spring.bookingservice.dto.CreateSlotRequestDTO;
import org.spring.bookingservice.dto.SlotResponseDTO;
import org.spring.bookingservice.service.SlotService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(path= "/slots")
@RequiredArgsConstructor
public class SlotController {

    private final SlotService slotService;

    @PostMapping(value = "/", consumes = "application/json")
    public ResponseEntity<SlotResponseDTO> createSlot(@RequestBody CreateSlotRequestDTO requestDTO) {
        SlotResponseDTO response = slotService.createSlot(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }


}
