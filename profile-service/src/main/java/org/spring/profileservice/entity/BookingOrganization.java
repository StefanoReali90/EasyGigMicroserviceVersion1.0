package org.spring.profileservice.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.spring.profileservice.utility.OrganizationType;

import java.util.List;

@Entity
@Data
public class BookingOrganization {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @ManyToOne(cascade = CascadeType.ALL)
    private City city;

    @Column
    private String partitaIva;

    @Column
    private String description;



    @Column(nullable = false)
    private String eventsHistory;

    @Column(nullable = false)
    private OrganizationType type;

    @ManyToMany(mappedBy = "organizations")
    private List<User> promoters;

    @OneToMany(mappedBy = "bookingOrganization", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Invitation> invitations;
}
