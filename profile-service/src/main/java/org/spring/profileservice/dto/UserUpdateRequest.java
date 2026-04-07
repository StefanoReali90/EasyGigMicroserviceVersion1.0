package org.spring.profileservice.dto;

public record UserUpdateRequest (
        String firstName,
        String lastName,
        String email,
        String password
){
}
