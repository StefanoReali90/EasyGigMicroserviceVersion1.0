package org.spring.bookingservice.repository;

import org.spring.bookingservice.entity.BookingRequest;
import org.spring.bookingservice.utility.BookingSlotState;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRequestRepository extends JpaRepository<BookingRequest,Long> {

    List<BookingRequest> findByStatusAndCreatedAtBefore(BookingSlotState status, LocalDateTime dateTime);
    List<BookingRequest> findBySlotIdAndStatusAndIdNot(Long slotId, BookingSlotState status, Long idToExclude);

    int countBySlotIdAndStatusAndIdNot(Long id, BookingSlotState bookingSlotState, Long bookingRequestId);
}
