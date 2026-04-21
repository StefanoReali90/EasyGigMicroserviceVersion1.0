package org.spring.bookingservice.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Data
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private LocalTime soundCheckTime;

    private String securityDetails;

    @ManyToOne(fetch = FetchType.LAZY)
    private BookingRequest bookingRequest;

}
