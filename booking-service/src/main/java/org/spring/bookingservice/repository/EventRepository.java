package org.spring.bookingservice.repository;

import org.spring.bookingservice.entity.BookingRequest;
import org.spring.bookingservice.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EventRepository extends JpaRepository<Event,Long> {
}
