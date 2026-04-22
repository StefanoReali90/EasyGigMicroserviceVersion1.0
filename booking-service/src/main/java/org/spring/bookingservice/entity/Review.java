package org.spring.bookingservice.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long reviewerId;

    private Long reviewedId;
    @Column(nullable = false)
    private int rate;
    @Column(nullable = false)
    private String comment;
    
    @Column(nullable = false)
    private String role;

    @Column(nullable = false)
    private LocalDateTime createdAt;



    @ManyToOne(fetch = FetchType.LAZY)
    private BookingRequest bookingRequest;


}
