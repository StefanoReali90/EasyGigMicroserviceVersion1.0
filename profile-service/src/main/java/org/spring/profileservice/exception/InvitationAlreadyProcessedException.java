package org.spring.profileservice.exception;

public class InvitationAlreadyProcessedException extends RuntimeException {
    public InvitationAlreadyProcessedException(String message) {
        super(message);
    }
}
