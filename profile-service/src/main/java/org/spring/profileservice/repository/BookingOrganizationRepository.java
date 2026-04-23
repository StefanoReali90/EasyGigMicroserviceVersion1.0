package org.spring.profileservice.repository;

import org.spring.profileservice.entity.BookingOrganization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingOrganizationRepository extends JpaRepository<BookingOrganization, Long> {
    List<BookingOrganization> findByNameContainingIgnoreCase(String name);
    List<BookingOrganization> findByCityNameIgnoreCase(String cityName);
}
