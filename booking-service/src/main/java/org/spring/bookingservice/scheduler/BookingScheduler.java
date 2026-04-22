package org.spring.bookingservice.scheduler;


import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.spring.bookingservice.dto.BookingExpiredEvent;
import org.spring.bookingservice.entity.BookingRequest;
import org.spring.bookingservice.entity.Slot;
import org.spring.bookingservice.repository.BookingRequestRepository;
import org.spring.bookingservice.repository.SlotRepository;
import org.spring.bookingservice.service.BookingProducer;
import org.spring.bookingservice.utility.BookingSlotState;
import org.spring.bookingservice.utility.SlotState;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class BookingScheduler {

    private final BookingRequestRepository bookingRequestRepository;

    private final SlotRepository slotRepository;

    private final BookingProducer bookingProducer;

    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void fiveDaysController() {
        List<BookingRequest> bookingRequests = bookingRequestRepository.findByStatusAndCreatedAtBefore(BookingSlotState.PENDING, LocalDateTime.now().minusDays(5));

        for (BookingRequest bookingRequest : bookingRequests) {

            bookingRequest.setStatus(BookingSlotState.EXPIRED);

            Slot slot = bookingRequest.getSlot();

            if (bookingRequestRepository.countBySlotIdAndStatusAndIdNot(slot.getId(), BookingSlotState.PENDING, bookingRequest.getId()) == 0) {

                slot.setState(SlotState.AVAILABLE);

            } else {

                slot.setState(SlotState.PENDING);

            }
            bookingRequestRepository.save(bookingRequest);

            slotRepository.save(slot);
            BookingExpiredEvent event = new BookingExpiredEvent(
                    bookingRequest.getId(),
                    bookingRequest.getUserId(),
                    slot.getId(),
                    bookingRequest.getVenueId()
            );
            bookingProducer.sendStrikeEvent(event);


        }


    }
}
