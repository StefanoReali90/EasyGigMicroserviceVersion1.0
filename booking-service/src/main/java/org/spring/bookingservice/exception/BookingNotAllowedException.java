package org.spring.bookingservice.exception;

public class BookingNotAllowedException extends RuntimeException {
    public BookingNotAllowedException(String message) {
        super(message);
    }
}
