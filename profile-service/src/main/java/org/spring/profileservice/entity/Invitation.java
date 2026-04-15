package org.spring.profileservice.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.spring.profileservice.utility.GroupType;
import org.spring.profileservice.utility.InvitationStatus;

@Entity
@Data
public class Invitation {

    @Id//id dell'invito generato automaticamente
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)//email obbligatoria
    private String email;

    @Column(nullable = false, unique = true)//tokenJwt obbligatorio e unico
    private String tokenJwt;

    @ManyToOne //relazione molti a uno con le band
    @JoinColumn
    private Band band;

    @ManyToOne //relazione molti a uno con le organizzazioni
    private BookingOrganization bookingOrganization;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private InvitationStatus status;//stato dell'invito
    @Column
    private Long groupId;
    @Column(nullable = false)
    private GroupType groupType;

    public void addBand(Band band) {//metodo helper per aggiungere le band
        this.band = band;
        band.addInvitation(this);
    }

    public void removeBand(Band band) {//metodo helper per rimuovere le band
        this.band.removeInvitation(this);
        band.removeInvitation(this);
    }
    public void addBookingOrganization(BookingOrganization bookingOrganization) {//metodo helper per aggiungere un organizzazione
        this.bookingOrganization = bookingOrganization;
        bookingOrganization.addInvitation(this);
    }
    public void removeBookingOrganization(BookingOrganization bookingOrganization) {//metodo helper per rimuovere un organizzazione
        this.bookingOrganization.removeInvitation(this);
        bookingOrganization.removeInvitation(this);
    }

}
