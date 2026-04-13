package org.spring.notificationservice.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.spring.notificationservice.utility.NotificationStatus;

import java.time.LocalDate;

@Entity
@Data
public class NotificationLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    LocalDate sendDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    NotificationStatus status;

    @Column(nullable = false)
    String email;


}
