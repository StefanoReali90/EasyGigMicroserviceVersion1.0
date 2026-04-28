package org.spring.bookingservice.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.spring.bookingservice.utility.BookingSlotState;
import org.spring.bookingservice.utility.RequesterType;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Rappresentazione di una proposta di prenotazione per uno slot temporale.
 * Gestisce il workflow di approvazione tra Artist, Venue e Promoter.
 */
@Entity
@Data
public class BookingRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Riferimento allo slot temporale oggetto della richiesta.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    private Slot slot;

    /**
     * Identificativo dell'utente richiedente (Artist o Promoter).
     */
    @Column(nullable = false)
    private Long userId;

    /**
     * Identificativo della Venue proprietaria dello slot.
     */
    @Column(nullable = false)
    private Long venueId;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    /**
     * Data di scadenza automatica della richiesta (default: 5 giorni dalla creazione).
     */
    @Column(nullable = false)
    private LocalDateTime expirationDate = LocalDateTime.now().plusDays(5);

    private String cancellationReason;

    @Enumerated(EnumType.STRING)
    private BookingSlotState status;

    /**
     * Identificativo opzionale per raggruppare più richieste (es. tour o eventi multi-data).
     */
    private String groupId;

    private Long bandId;

    @Enumerated(EnumType.STRING)
    private RequesterType requesterType;

    /**
     * Inizializzazione automatica dello stato e delle scadenze alla persistenza.
     */
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.expirationDate = this.createdAt.plusDays(5);
        this.status = BookingSlotState.PENDING;
    }

    @OneToMany(mappedBy = "bookingRequest", cascade = CascadeType.ALL)
    private List<Event> events;

    @OneToMany(mappedBy = "bookingRequest", cascade = CascadeType.ALL)
    private List<Review> reviews;
}
