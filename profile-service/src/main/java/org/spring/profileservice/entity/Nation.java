package org.spring.profileservice.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;

import java.util.ArrayList;
import java.util.List;

@Entity
@Data
public class Nation {
    @Id//id della nazione generato automaticamente
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(unique = true, nullable = false)
    private String name; //nome della nazione unico e obbligatorio
    @OneToMany(mappedBy = "nation")//relazione uno o molti con le regioni
    @ToString.Exclude
    private List<Region> regions = new ArrayList<>();

    public void   addRegion(Region region) { //metodo helper per aggiungere una regione
        regions.add(region);
        region.setNation(this);
    }

    public void  removeRegion(Region region) { //metodo helper per rimuovere una regione
        regions.remove(region);
        region.setNation(null);
    }



}
