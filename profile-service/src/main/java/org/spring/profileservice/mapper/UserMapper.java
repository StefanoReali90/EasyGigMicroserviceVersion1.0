package org.spring.profileservice.mapper;

import org.mapstruct.*;
import org.spring.profileservice.dto.UserRegistrationRequest;
import org.spring.profileservice.dto.UserResponse;
import org.spring.profileservice.dto.UserUpdateRequest;
import org.spring.profileservice.entity.User;

@Mapper
public interface UserMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "passwordHash", source = "password")
    @Mapping(target = "reputation", constant = "0.0")
    @Mapping(target = "reviewCount", constant = "0")
    @Mapping(target = "venues", ignore = true)
    @Mapping(target = "stateAccount", ignore = true)
    @Mapping(target = "organizations", ignore = true)
    User toEntity(UserRegistrationRequest request);

    UserResponse toResponse(User user);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "passwordHash", source = "password")
    @Mapping(target = "reputation", ignore = true)
    @Mapping(target = "reviewCount", ignore = true)
    void updateUserFromDto(UserUpdateRequest dto, @MappingTarget User user);
}
