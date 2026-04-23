package org.spring.bookingservice.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.spring.bookingservice.utility.BookingSlotState;
import org.spring.bookingservice.utility.RequesterType;

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

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private Long venueId;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    private LocalDateTime expirationDate =LocalDateTime.now()
    .plusDays(5);

    private String cancellationReason;

    @Enumerated(EnumType.STRING)
    private BookingSlotState status;

    private String groupId;

    private Long bandId;

    @Enumerated(EnumType.STRING)
    private RequesterType requesterType;


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
