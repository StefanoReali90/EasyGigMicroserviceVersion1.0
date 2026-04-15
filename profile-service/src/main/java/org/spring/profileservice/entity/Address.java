package org.spring.profileservice.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Address {
    @Id //id dell'indirizzo con valore generato automaticamente
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false) //Indicazione della via
    private String street;

    @Column(nullable = false)// Indicazione del numero civico
    private String houseNumber;

    @Column(nullable = false)//Indicazione del CAP
    private String zipCode;

    @ManyToOne //relazione molti a uno verso la città.
    private City city;

    @OneToOne //relazione uno a uno verso Venue
    private Venue venue;

}
