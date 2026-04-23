package org.spring.profileservice.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class MusicTrack {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String url;

    private boolean isExternal; // true if Spotify, false if Cloudinary

    @ManyToOne(fetch = FetchType.LAZY)
    private Band band;

    @ManyToOne(fetch = FetchType.LAZY)
    private User artist;
}
