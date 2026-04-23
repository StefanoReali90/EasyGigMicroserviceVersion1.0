package org.spring.profileservice.repository;

import org.spring.profileservice.entity.Venue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
@Repository
public interface VenueRepository extends JpaRepository<Venue, Long> {
    List<Venue> findByDirectorId(Long directorId);
    List<Venue> findByAddressCityNameIgnoreCase(String cityName);
    List<Venue> findByAddressCityNameIgnoreCaseOrderByDirectorReputationDesc(String cityName);
    List<Venue> findAllByOrderByDirectorReputationDesc();
    List<Venue> findByNameContainingIgnoreCaseOrderByDirectorReputationDesc(String name);
    List<Venue> findByNameContainingIgnoreCase(String name);
    List<Venue> findByNameContainingIgnoreCaseAndAddressCityNameIgnoreCase(String name, String cityName);
    List<Venue> findByNameContainingIgnoreCaseAndAddressCityNameIgnoreCaseOrderByDirectorReputationDesc(String name, String cityName);


}
