package org.spring.profileservice.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.spring.profileservice.model.InvitingGroup;
import org.spring.profileservice.utility.BandType;

import java.util.ArrayList;
import java.util.List;

@Entity
@Data
public class Band implements InvitingGroup {

    @Id // id della band generato automaticamente
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)// nome della band obbligatorio
    private String name;

    @Column(nullable = false)//definizione del cachet obbligatoria
    private Integer cachet;

    @Column(nullable = false)// definizione della trattabilità del cachet
    private boolean negotiable;

    @Enumerated //tipologia band
    private BandType bandType;

    @ManyToOne//relazione molti a uno con la citta
    @JoinColumn(name = "city_id", nullable = false)
    private City city;

    private String linkStreaming;//link ai brani della band opzionali

    private String filePath; //link alla source per il caricamento di almeno un brano.

    @OneToMany(mappedBy = "band", cascade = CascadeType.ALL, orphanRemoval = true) //relazione uno a molti con le foto
    private List<Photo> photos = new ArrayList<>();

    @ManyToMany//relazione molti a molti con i membri della band
    @JoinTable(
            name = "band_members",
            joinColumns = @JoinColumn(name = "band_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private List<User> members= new ArrayList<>();


    @ManyToMany// relazione molti a molti con il genere musicale
    @JoinTable(name = "band_genres")
    private List<Genre> genres=new ArrayList<Genre>();

    @OneToMany(mappedBy = "band", cascade = CascadeType.ALL, orphanRemoval = true)//relazione uno a molti con gli inviti
    private List<Invitation> invitations=  new ArrayList<>();

    @Override
    public List<User> getMembers() {
        return members;
    }//funzione per recuperare la lista dei membri della band

    @Override //funzione per aggiungere un membro
    public void addMember(User user) {
        if(members == null) {
            members = new ArrayList<>();
        }
        if (!this.members.contains(user)) {
            this.members.add(user);
        }
    }
    public void addPhoto(Photo photo) {
        this.photos.add(photo);
        photo.setBand(this); // aggiorna il lato "Many" della relazione photo
    }

    public void addInvitation(Invitation invitation) {
        this.invitations.add(invitation);
        invitation.setBand(this); // aggiorna il lato "Many" della relazione invitation
    }
    public void addGenre(Genre genre) {
        this.genres.add(genre);
        genre.getBands().add(this);//aggiorna il lato "Many" del genere

    }
}
