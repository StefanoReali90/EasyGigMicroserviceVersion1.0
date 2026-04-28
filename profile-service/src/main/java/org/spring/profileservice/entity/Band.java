package org.spring.profileservice.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.spring.profileservice.model.InvitingGroup;
import org.spring.profileservice.utility.BandType;

import java.util.ArrayList;
import java.util.List;

/**
 * Rappresentazione di una formazione musicale.
 * Implementa InvitingGroup per consentire il workflow di inviti via email.
 */
@Entity
@Data
public class Band implements InvitingGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    /**
     * Compenso richiesto per l'esibizione (valore intero).
     */
    @Column(nullable = false)
    private Integer cachet;

    /**
     * Flag per indicare se il cachet è aperto a negoziazione.
     */
    @Column(nullable = false)
    private boolean negotiable;

    @Enumerated
    private BandType bandType;

    @Column(nullable = false)
    private Double reputation = 0.0;

    @Column(nullable = false)
    private Integer reviewCount = 0;

    /**
     * Sede principale o città di riferimento del gruppo.
     */
    @ManyToOne
    @JoinColumn(name = "city_id", nullable = false)
    private City city;

    @OneToMany(mappedBy = "band", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MusicTrack> tracks = new ArrayList<>();

    @OneToMany(mappedBy = "band", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Photo> photos = new ArrayList<>();

    /**
     * Elenco dei musicisti associati al profilo della band.
     */
    @ManyToMany
    @JoinTable(
            name = "band_members",
            joinColumns = @JoinColumn(name = "band_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private List<User> members = new ArrayList<>();

    @ManyToMany
    @JoinTable(name = "band_genres")
    private List<Genre> genres = new ArrayList<Genre>();

    @OneToMany(mappedBy = "band", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Invitation> invitations = new ArrayList<>();

    @Override
    public List<User> getMembers() {
        return members;
    }

    /* Business Logic per la gestione dinamica del gruppo */

    @Override
    public void addMember(User user) {
        if(members == null) {
            members = new ArrayList<>();
        }
        if (!this.members.contains(user)) {
            this.members.add(user);
        }
    }

    public void addUser(User user) {
        this.members.add(user);
        user.getBands().add(this);
    }

    public void addPhoto(Photo photo) {
        this.photos.add(photo);
        photo.setBand(this);
    }

    public void addInvitation(Invitation invitation) {
        this.invitations.add(invitation);
        invitation.setBand(this);
    }

    public void addGenre(Genre genre) {
        this.genres.add(genre);
        genre.getBands().add(this);
    }

    public void removeInvitation(Invitation invitation) {
        this.invitations.remove(invitation);
        invitation.setBand(null);
    }

    public void removeGenre(Genre genre) {
        this.genres.remove(genre);
        genre.getBands().remove(this);
    }

    public void removePhoto(Photo photo) {
        this.photos.remove(photo);
        photo.setBand(null);
    }

    public void removeUser(User user) {
        this.members.remove(user);
        user.getBands().remove(this);
    }

    public void addTrack(MusicTrack track) {
        this.tracks.add(track);
        track.setBand(this);
    }
}
