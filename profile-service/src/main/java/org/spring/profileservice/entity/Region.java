package org.spring.profileservice.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;

import java.util.ArrayList;
import java.util.List;

@Entity
@Data
public class Region {
    @Id //id della regione generato automaticamente
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name; //nome della regione obbligatorio

    @OneToMany(mappedBy = "region")//relazione uno a molti con le citta
    @ToString.Exclude
    private List<City> cities= new ArrayList<>();

    @ManyToOne //relazione molti a uno con le nazioni
    private Nation nation;

    public void addCity(City city) {//metodo helper per aggiungere una città
        cities.add(city);
        city.setRegion(this);
    }

    public void removeCity(City city) {//metodo helpere per rimuovere una città
        cities.remove(city);
        city.setRegion(null);
    }
}
