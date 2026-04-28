package org.spring.bookingservice.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.spring.bookingservice.utility.SlotState;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Entità che modella una disponibilità temporale per un evento.
 * Definisce la finestra temporale e lo stato di occupazione di una Venue.
 */
@Entity
@Data
public class Slot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "start_time")
    private LocalDateTime start;

    @Column(name = "end_time")
    private LocalDateTime end;

    @Enumerated(EnumType.STRING)
    private SlotState state;

    /**
     * Identificativo della Venue che mette a disposizione lo slot.
     */
    private Long venueId;

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "slot")
    private List<BookingRequest> bookingRequests = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    private VenueConfiguration venueConfiguration;
}
