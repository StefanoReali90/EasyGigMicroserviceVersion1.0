package org.spring.bookingservice.repository;

import org.spring.bookingservice.entity.Slot;
import org.spring.bookingservice.utility.SlotState;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SlotRepository extends JpaRepository<Slot,Long> {
    List<Slot> findByVenueIdAndStartBetween(Long venueId, LocalDateTime startOfMonth, LocalDateTime endOfMonth);
    List<Slot> findByVenueIdInAndStartBetweenAndState(List<Long>venueIds, LocalDateTime startOfDay, LocalDateTime endOfDay, SlotState state);

}
