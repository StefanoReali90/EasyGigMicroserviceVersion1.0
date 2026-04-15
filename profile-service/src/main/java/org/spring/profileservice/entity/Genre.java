package org.spring.profileservice.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Entity
@Data
public class Genre {
    @Id//id del genere generato automaticamente
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true) // nome del genere unico e obbligatorio
    private String name;

    @ManyToMany(mappedBy = "genres") //relazione molti a molti con le band
    private List<Band> bands = new ArrayList<>();

    public void  addBand(Band band) {//metodo helper per aggiungere una band
        bands.add(band);
        band.addGenre(this);
    }
    public void removeBand(Band band) {// metodo helper per rimuovere una band
        bands.remove(band);
        band.removeGenre(this);
    }
}
