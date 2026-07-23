package org.spring.bookingservice.repository;

import org.spring.bookingservice.entity.Slot;
import org.spring.bookingservice.utility.SlotState;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface SlotRepository extends JpaRepository<Slot,Long> {
    List<Slot> findByVenueIdAndStartBetween(Long venueId, LocalDateTime startOfMonth, LocalDateTime endOfMonth);
    List<Slot> findByVenueIdInAndStartBetweenAndState(List<Long>venueIds, LocalDateTime startOfDay, LocalDateTime endOfDay, SlotState state);
    List<Slot> findByVenueId(Long venueId);

    @Query("SELECT s FROM Slot s WHERE s.venueId = :venueId AND s.start < :end AND s.end > :start")
    List<Slot> findOverlappingSlots(@Param("venueId") Long venueId, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}
