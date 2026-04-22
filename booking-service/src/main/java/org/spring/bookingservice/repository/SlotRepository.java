package org.spring.bookingservice.repository;

import org.spring.bookingservice.entity.Slot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.lang.ScopedValue;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SlotRepository extends JpaRepository<Slot,Long> {
    Slot findById(Slot slotId);
    List<Slot> findByVenueIdAndStartBetween(Long venueId, LocalDateTime startOfMonth, LocalDateTime endOfMonth);
}
