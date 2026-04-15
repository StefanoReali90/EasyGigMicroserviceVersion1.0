package org.spring.profileservice.dto;

import java.util.List;

public record UserUpdateRequest (
        String firstName,
        String lastName,
        String email,
        String password
){
}
