package org.spring.profileservice.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Address {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private String street;
    @Column(nullable = false)
    private String houseNumber;
    @Column(nullable = false)
    private String zipCode;
    @ManyToOne
    private City city;
    @OneToOne
    private Venue venue;

}
