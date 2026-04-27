package org.spring.profileservice.dto;

public record AuthResponse(String token, UserResponse user) {}
