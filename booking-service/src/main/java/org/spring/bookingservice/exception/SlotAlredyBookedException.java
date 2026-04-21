package org.spring.bookingservice.exception;

public class SlotAlredyBookedException extends RuntimeException {
    public SlotAlredyBookedException(String message) {
        super(message);
    }
}
