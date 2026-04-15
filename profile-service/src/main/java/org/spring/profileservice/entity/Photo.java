package org.spring.profileservice.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Photo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column
    private String name;
    @Column
    private String source;

    @Column(nullable = false)
    private boolean isPrimary;

    @ManyToOne
    private Band band;

    @ManyToOne
    private Venue venue;
}
