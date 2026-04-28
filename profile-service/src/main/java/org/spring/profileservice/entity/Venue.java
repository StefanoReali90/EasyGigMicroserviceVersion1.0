package org.spring.profileservice.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;
import org.spring.profileservice.utility.VenueType;

import java.util.List;


/**
 * Rappresentazione di un locale o spazio per eventi (Venue).
 * Gestita da un utente con privilegi di Director/Venue Manager.
 */
@Entity
@Data
public class Venue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false, unique = true)
    private String phone;

    /**
     * Capienza massima autorizzata del locale.
     */
    @Column(nullable = false)
    private Integer capacity;

    @Column(nullable = false)
    private VenueType type;

    /**
     * Descrizione tecnica della strumentazione audio/luci disponibile (Technical Rider).
     */
    @Column(nullable = false)
    private String equipment;

    @OneToOne(cascade = CascadeType.ALL)
    private Address address;

    /**
     * Proprietario o gestore responsabile della Venue.
     */
    @ManyToOne
    @ToString.Exclude
    private User director;

    @OneToMany(mappedBy = "venue", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Photo> photos;

    /* Helper Methods per la gestione delle risorse multimediali */

    public void addPhoto(Photo photo) {
        this.photos.add(photo);
        photo.setVenue(this);
    }

    public void removePhoto(Photo photo) {
        this.photos.remove(photo);
        photo.setVenue(null);
    }
}
