package org.spring.profileservice.repository;

import org.spring.profileservice.entity.Invitation;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InvitationRepository extends JpaRepository<Invitation, Long> {

    Invitation findByTokenJwt(String tokenJwt);
}
