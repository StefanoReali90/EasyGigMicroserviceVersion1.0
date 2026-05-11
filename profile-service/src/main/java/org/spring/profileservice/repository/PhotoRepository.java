package org.spring.profileservice.repository;

import org.spring.profileservice.entity.Photo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PhotoRepository extends JpaRepository<Photo, Long> {
    List<Photo> findByBandId(Long bandId);
    List<Photo> findByVenueId(Long venueId);
    List<Photo> findByOrganizationId(Long organizationId);
}
