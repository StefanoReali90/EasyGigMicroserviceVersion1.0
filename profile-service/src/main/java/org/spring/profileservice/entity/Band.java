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

    @OneToMany(mappedBy = "band", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MusicTrack> tracks = new ArrayList<>();

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
    public void addUser(User user) {//metodo helper per aggiungere un utente
        this.members.add(user);
        user.getBands().add(this);
    }
    public void addPhoto(Photo photo) {//metodo helper per aggiungere un foto
        this.photos.add(photo);
        photo.setBand(this); // aggiorna il lato "Many" della relazione photo
    }

    public void addInvitation(Invitation invitation) { //metodo helper per aggiungere un invito
        this.invitations.add(invitation);
        invitation.setBand(this); // aggiorna il lato "Many" della relazione invitation
    }
    public void addGenre(Genre genre) { //metodo helper per aggiungere un genere
        this.genres.add(genre);
        genre.getBands().add(this);//aggiorna il lato "Many" del genere

    }
    public void removeInvitation(Invitation invitation) {//metodo helper per rimuovere un invito
        this.invitations.remove(invitation);
        invitation.setBand(null);
    }
    public void removeGenre(Genre genre) { //metodo helper per rimuovere un genere
        this.genres.remove(genre);
        genre.getBands().remove(this);
    }
    public void removePhoto(Photo photo) { //metodo helper per rimuovere una foto
        this.photos.remove(photo);
        photo.setBand(null);
    }
    public void removeUser(User user) { //metodo helper per rimuovere un utente
        this.members.remove(user);
        user.getBands().remove(this);
    }

    public void addTrack(MusicTrack track) {
        this.tracks.add(track);
        track.setBand(this);
    }
}
