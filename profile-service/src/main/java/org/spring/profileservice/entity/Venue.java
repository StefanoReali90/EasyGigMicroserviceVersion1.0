package org.spring.profileservice.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;
import org.spring.profileservice.utility.VenueType;

import java.util.List;


@Entity
@Data
public class Venue {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false,unique = true)
    private String name;
    @Column(nullable = false, unique = true)
    private String phone;
    @Column(nullable = false)
    private Integer capacity;
    @Column(nullable = false)
    private VenueType type;
    @Column(nullable = false)
    private String equipment;
    @OneToOne(cascade = CascadeType.ALL)
    private Address address;
    @ManyToOne
    @ToString.Exclude
    private User director;
    @OneToMany(mappedBy = "venue", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Photo> photos;




}
