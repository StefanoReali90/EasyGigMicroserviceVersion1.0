package org.spring.bookingservice.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.spring.bookingservice.utility.SlotState;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
public class Slot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime start;

    private LocalDateTime end;

    @Enumerated(EnumType.STRING)
    private SlotState state;

    private Long venueId;

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "slot")
    private List<BookingRequest> bookingRequests = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    private VenueConfiguration venueConfiguration;


}
