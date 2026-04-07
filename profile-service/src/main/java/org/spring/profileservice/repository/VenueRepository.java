package org.spring.profileservice.repository;

import org.spring.profileservice.entity.Venue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
@Repository
public interface VenueRepository extends JpaRepository<Venue, Long> {
    List<Venue> findByDirectorId(Long directorId);
}
