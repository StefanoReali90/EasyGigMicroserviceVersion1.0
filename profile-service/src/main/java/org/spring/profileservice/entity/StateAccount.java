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
    @Id //id dello stato dell'account generato automaticamente
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)// numero di strikes
    private Integer strikes = 0;

    @Column(nullable = false)//verifica se l'account è bannato
    private boolean isBanned = false;

    @Column// data di fine ban
    private LocalDate banUntil;

    @Column//data dell'ultimo ban
    private LocalDateTime lastBanDate;

}
