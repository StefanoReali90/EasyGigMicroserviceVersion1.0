package org.spring.profileservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;

import lombok.NoArgsConstructor;
import lombok.ToString;
import org.spring.profileservice.utility.UserType;

import java.util.ArrayList;
import java.util.List;

/**
 * Entità base per la gestione delle identità nel sistema.
 * Implementa la strategia JOINED per la specializzazione dei profili (Artist, Promoter, Venue Manager).
 */
@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Inheritance(strategy = InheritanceType.JOINED)
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Enumerated(EnumType.STRING)
    private UserType role;

    @Column(nullable = false)
    private Double reputation = 0.0;

    @Column(nullable = false)
    private Integer reviewCount = 0;

    @Column(nullable = false)
    private Boolean privacyAccepted;

    /**
     * Associazione bidirezionale con le formazioni musicali (Band).
     */
    @ManyToMany(mappedBy = "members")
    private List<Band> bands = new ArrayList<>();

    /**
     * Venue gestite direttamente dall'utente (ruolo Director/Venue Manager).
     */
    @OneToMany(mappedBy = "director", fetch = FetchType.LAZY)
    @ToString.Exclude
    private List<Venue> venues = new ArrayList<>();

    /**
     * Stato amministrativo del profilo (es. Active, Suspended).
     */
    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JoinColumn(name = "state_account_id")
    private StateAccount stateAccount;

    /**
     * Organizzazioni di booking di cui l'utente è membro.
     */
    @ManyToMany
    @JoinTable(
            name = "user_organization",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "organization_id")
    )
    @ToString.Exclude
    private List<BookingOrganization> organizations = new ArrayList<>();

    @OneToMany(mappedBy = "artist", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MusicTrack> tracks = new ArrayList<>();

    /* Helper Methods per il mantenimento della coerenza bidirezionale delle relazioni */

    public void addVenue(Venue venue) {
        this.venues.add(venue);
        venue.setDirector(this);
    }

    public void removeVenue(Venue venue) {
        this.venues.remove(venue);
        venue.setDirector(null);
    }

    public void addBand(Band band) {
        this.bands.add(band);
        band.addUser(this);
    }

    public void removeBand(Band band) {
        this.bands.remove(band);
        band.removeUser(this);
    }

    public void addTrack(MusicTrack track) {
        this.tracks.add(track);
        track.setArtist(this);
    }
}
