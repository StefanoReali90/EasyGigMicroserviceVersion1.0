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

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Enumerated(EnumType.STRING)
    private UserType role;

    @Column(nullable = false)
    private Double reputation = 0.0;

    @Column(nullable = false)
    private Integer reviewCount = 0;

    @Column(nullable = false)
    private Boolean privacyAccepted;

    @ManyToMany(mappedBy = "members")
    private List<Band> bands = new ArrayList<>();

    @OneToMany(mappedBy = "director", fetch = FetchType.LAZY)
    @ToString.Exclude //Evitiamo loop infiniti nel toString(=
    private List<Venue> venues;

    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JoinColumn(name = "state_account_id")
    private StateAccount stateAccount;

    @ManyToMany
    @JoinTable(
            name = "user_organization", // Nome della tabella di giunzione
            joinColumns = @JoinColumn(name = "user_id"), // Colonna per questa entità (User)
            inverseJoinColumns = @JoinColumn(name = "organization_id") // Colonna per l'altra entità
    )
    @ToString.Exclude
    private List<BookingOrganization> organizations;


}
