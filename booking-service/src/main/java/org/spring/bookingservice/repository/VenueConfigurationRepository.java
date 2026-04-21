package org.spring.bookingservice.repository;

import org.spring.bookingservice.entity.VenueConfiguration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VenueConfigurationRepository extends JpaRepository<VenueConfiguration,Long> {
}
