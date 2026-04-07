package org.spring.profileservice.repository;

import org.spring.profileservice.entity.BookingOrganization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BookingOrganizationRepository extends JpaRepository<BookingOrganization, Long> {
}
