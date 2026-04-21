package org.spring.bookingservice.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.spring.bookingservice.utility.BookingSlotState;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Data
public class BookingRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    private Slot slot;

    private Long UserId;

    private Long venueId;

    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime expirationDate =LocalDateTime.now()
    .plusDays(5);

    @Enumerated(EnumType.STRING)
    private BookingSlotState status;


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
