package org.spring.bookingservice.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long reviewerId;

    private Long reviewedId;

    private int rate;

    private String comment;

    private String role;



    @ManyToOne(fetch = FetchType.LAZY)
    private BookingRequest bookingRequest;


}
