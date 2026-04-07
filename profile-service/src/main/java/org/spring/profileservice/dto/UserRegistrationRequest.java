package org.spring.profileservice.dto;

import org.spring.profileservice.utility.UserType;

public record UserRegistrationRequest(
        String email,
        String password,
        String firstName,
        String lastName,
        UserType role,
        Boolean privacyAccepted
) {
}
