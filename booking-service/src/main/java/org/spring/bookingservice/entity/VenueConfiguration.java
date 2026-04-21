package org.spring.bookingservice.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Entity
@Data
public class VenueConfiguration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int minCachet;

    private List<String> genres = new ArrayList<>();

    private String equipment;

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "venueConfiguration")
    private List<Slot> slots = new ArrayList<>();

}
