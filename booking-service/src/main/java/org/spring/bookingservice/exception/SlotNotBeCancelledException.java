package org.spring.bookingservice.exception;

public class SlotNotBeCancelledException extends RuntimeException {
    public SlotNotBeCancelledException(String message) {
        super(message);
    }
}
