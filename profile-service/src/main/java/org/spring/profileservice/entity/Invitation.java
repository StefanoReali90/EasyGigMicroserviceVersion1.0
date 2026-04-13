package org.spring.profileservice.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.spring.profileservice.utility.InvitationStatus;

@Entity
@Data
public class Invitation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false, unique = true)
    private String tokenJwt;

    @ManyToOne
    @JoinColumn(nullable = false)
    private Band band;

    @Column(nullable = false)
    private InvitationStatus status;
}
