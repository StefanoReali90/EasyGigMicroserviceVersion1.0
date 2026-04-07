package org.spring.profileservice.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.spring.profileservice.utility.BandType;

import java.util.List;

@Entity
@Data
public class Band {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private Integer cachet;

    @Column(nullable = false)
    private boolean negotiable;

    @Enumerated
    private BandType bandType;

    @ManyToOne
    @JoinColumn(name = "city_id", nullable = false)
    private City city;

    private String linkStreaming;

    private String filePath;

    private String imagePath;

    @ElementCollection
    @CollectionTable(name="band_members", joinColumns = @JoinColumn(name = "band_id"))
    @Column(name = "user_id")
    private List<Long> memberIds;

    @ManyToMany
    private List<Genre> genres;

}
