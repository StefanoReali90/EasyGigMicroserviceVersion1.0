package org.spring.profileservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;

import lombok.NoArgsConstructor;
import lombok.ToString;
import org.spring.profileservice.utility.UserType;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Inheritance(strategy = InheritanceType.JOINED)
public class User {

    @Id//id dell'utente generato automaticamente
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email; //email dell'utente unica e obbligatoria

    @Column(nullable = false) //password hashata obbligatoria
    private String passwordHash;

    @Column(nullable = false) //nome dell'utente obbligatorio
    private String firstName;

    @Column(nullable = false) //cognome dell'utente obbligatorio
    private String lastName;

    @Enumerated(EnumType.STRING) //ruolo dell'utente
    private UserType role;

    @Column(nullable = false) //reputazione dell'utente
    private Double reputation = 0.0;

    @Column(nullable = false) //conteggio delle recensioni
    private Integer reviewCount = 0;

    @Column(nullable = false)//verifica accettazione privacy
    private Boolean privacyAccepted;

    @ManyToMany(mappedBy = "members")//relazione molti a molti  con le band
    private List<Band> bands = new ArrayList<>();

    @OneToMany(mappedBy = "director", fetch = FetchType.LAZY) //relazione uno a molti con le venue
    @ToString.Exclude //Evitiamo loop infiniti nel toString
    private List<Venue> venues = new ArrayList<>();

    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY) //relazione uno a uno con stateAccount
    @JoinColumn(name = "state_account_id")
    private StateAccount stateAccount;

    @ManyToMany //relazione molti a molti con le organizzazioni
    @JoinTable(
            name = "user_organization", // Nome della tabella di giunzione
            joinColumns = @JoinColumn(name = "user_id"), // Colonna per questa entità (User)
            inverseJoinColumns = @JoinColumn(name = "organization_id") // Colonna per l'altra entità
    )
    @ToString.Exclude
    private List<BookingOrganization> organizations = new ArrayList<>();

    public void addVenue(Venue venue) {// metodo helper per aggiungere una venue
        this.venues.add(venue);
        venue.setDirector(this);
    }
    public void removeVenue(Venue venue) {//metodo helper per rimuovere una venue
        this.venues.remove(venue);
        venue.setDirector(null);
    }
    public void addBand(Band band) { //metodo helper per aggiungere una band
        this.bands.add(band);
        band.addUser(this);
    }

    public void removeBand(Band band) {//metodo helper per rimuovere una band
        this.bands.remove(band);
        band.removeUser(this);
    }


}
