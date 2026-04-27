package org.spring.profileservice.entity;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import lombok.Data;
import lombok.ToString;

@Entity
@Data
public class City {
    @Id //id della città generato automaticamente
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name; //nome della città obbligatorio

    @ManyToOne//relazione molti a uno con la regione
    private Region region;

    @OneToMany(mappedBy = "city")//relazione uno a molti con indirizzo
    @ToString.Exclude
    private List<Address> addresses = new ArrayList<>();

    @OneToMany(mappedBy = "city") //relazione uno a molti con le organizzazioni
    private List<BookingOrganization> bookingOrganizations = new ArrayList<>();


    public void addAddress(Address address) { //metodo helper per aggiungere un indirizzo
        addresses.add(address);
        address.setCity(this);
    }

    public void removeAddress(Address address) { //metodo helper per rimuovere un indirizzo
        addresses.remove(address);
        address.setCity(null);
    }

    public void addBookingOrganization(BookingOrganization bookingOrganization) {//metodo helper per aggiungere un organizzazione
        bookingOrganizations.add(bookingOrganization);
        bookingOrganization.setCity(this);
    }

    public void removeBookingOrganization(BookingOrganization bookingOrganization) {//metodo helper per rimuovere un organizzazione
        bookingOrganizations.remove(bookingOrganization);
        bookingOrganization.setCity(null);
    }


}
