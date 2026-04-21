package org.spring.bookingservice.exception;

public class BookingRequestNotFound extends RuntimeException {
    public BookingRequestNotFound(String message) {
        super(message);
    }
}
