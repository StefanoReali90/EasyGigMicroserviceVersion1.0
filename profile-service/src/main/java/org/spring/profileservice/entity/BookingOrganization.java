package org.spring.profileservice.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.spring.easygig3.utility.OrganizationType;

import java.util.List;

@Entity
@Data
public class BookingOrganization {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String eventsHistory;

    @Column(nullable = false)
    private OrganizationType type;

    @ManyToMany(mappedBy = "organizations")
    private List<User> promoters;
}
