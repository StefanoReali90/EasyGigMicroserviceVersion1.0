package org.spring.profileservice.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;
import org.spring.profileservice.utility.OrganizationType;

import java.util.List;

@Entity
@Data
public class City {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private String name;
    @ManyToOne
    private Region region;
    @OneToMany(mappedBy = "city")
    @ToString.Exclude
    private List<Address> addresses;

    @OneToMany(mappedBy = "city")
    private List<BookingOrganization> bookingOrganizations;


}
