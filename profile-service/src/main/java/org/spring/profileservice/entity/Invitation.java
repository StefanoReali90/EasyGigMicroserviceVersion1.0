package org.spring.profileservice.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.spring.profileservice.utility.GroupType;
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
    @JoinColumn
    private Band band;

    @ManyToOne
    private BookingOrganization bookingOrganization;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private InvitationStatus status;
    @Column
    private Long groupId;
    @Column(nullable = false)
    private GroupType groupType;

}
