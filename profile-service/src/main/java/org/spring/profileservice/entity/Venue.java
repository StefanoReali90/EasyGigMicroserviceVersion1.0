package org.spring.profileservice.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;
import org.mapstruct.Mapping;
import org.spring.profileservice.utility.VenueType;

import java.util.List;


@Entity
@Data
public class Venue {
    @Id//id della venue generato automaticamente
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false,unique = true)
    private String name; //nome della venue unico e obbligatorio

    @Column(nullable = false, unique = true)
    private String phone; //telefono della venue unico e obbligatorio

    @Column(nullable = false)
    private Integer capacity;// capacità del locale obbligatoria

    @Column(nullable = false)// tipologià di locale obbligatoria
    private VenueType type;

    @Column(nullable = false)//attrezzatura presente obbligatoria
    private String equipment;

    @OneToOne(cascade = CascadeType.ALL)//relazione uno a uno con l'indirizzo
    private Address address;

    @ManyToOne//relazione molti a uno con l'utente
    @ToString.Exclude
    private User director;
    @OneToMany(mappedBy = "venue", cascade = CascadeType.ALL, orphanRemoval = true)//relazione uno a molti con le foto
    private List<Photo> photos;

    public void addPhoto(Photo photo) {//metodo helper per aggiungere una foto
        this.photos.add(photo);
        photo.setVenue(this);
    }
    public void removePhoto(Photo photo) {//metodo helper per rimuovere una foto
        this.photos.remove(photo);
        photo.setVenue(null);
    }





}
