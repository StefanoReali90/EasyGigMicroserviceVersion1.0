package org.spring.profileservice.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.spring.profileservice.model.InvitingGroup;
import org.spring.profileservice.utility.BandType;

import java.util.List;

@Entity
@Data
public class Band implements InvitingGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private Integer cachet;

    @Column(nullable = false)
    private boolean negotiable;

    @Enumerated
    private BandType bandType;

    @ManyToOne
    @JoinColumn(name = "city_id", nullable = false)
    private City city;

    private String linkStreaming;

    private String filePath;

    private String imagePath;

    @ManyToMany
    @JoinTable(
            name = "band_members",
            joinColumns = @JoinColumn(name = "band_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private List<User> members;


    @ManyToMany
    private List<Genre> genres;

    @OneToMany(mappedBy = "band", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Invitation> invitations;

    @Override
    public List<User> getMembers() {
        return List.of();
    }

    @Override
    public void addMember(User user) {
        if (!this.members.contains(user)) {
            this.members.add(user);
        }
    }
}
