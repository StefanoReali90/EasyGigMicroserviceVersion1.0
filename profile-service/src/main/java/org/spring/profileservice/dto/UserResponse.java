package org.spring.profileservice.dto;

import org.spring.profileservice.utility.UserType;

public record UserResponse(
        Long id,
        String email,
        String firstName,
        String lastName,
        UserType role,
        Double reputation,
        Integer reviewCount
) {
}
