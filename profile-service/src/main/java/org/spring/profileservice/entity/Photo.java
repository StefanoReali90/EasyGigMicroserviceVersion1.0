package org.spring.profileservice.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Photo {

    @Id//id della foto generato automaticamente
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private String name;//nome della foto obbligatorio
    @Column(nullable = false)
    private String source;//percorso della foto obbligatorio

    @Column(nullable = false)
    private boolean isPrimary; //verifica se è una foto profilo

    @ManyToOne //relazione molti a uno con le band
    private Band band;

    @ManyToOne //relazione molti a uno con le venue
    private Venue venue;
}
