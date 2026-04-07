package org.spring.profileservice.entity;

import jakarta.persistence.*;
import lombok.Data;

import javax.swing.plaf.nimbus.State;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Data
public class StateAccount {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Integer strikes = 0;

    @Column(nullable = false)
    private boolean isBanned = false;

    @Column
    private LocalDate banUntil;

    @Column
    private LocalDateTime lastBanDate;

}
