package org.spring.profileservice.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.spring.profileservice.dto.AccountStatusResponse;
import org.spring.profileservice.entity.StateAccount;

import java.time.LocalDateTime;
import java.time.chrono.ChronoLocalDate;

@Mapper(componentModel = "spring")
public interface AccountStatusMapper {

    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "statusMessage", expression = "java(determineStatusMessage(stateAccount))")
    @Mapping(target = "strikes", expression = "java(stateAccount == null ? 0 : stateAccount.getStrikes())")
    @Mapping(target = "isBanned", expression = "java(stateAccount == null ? false : stateAccount.isBanned())")
    AccountStatusResponse toResponse(StateAccount stateAccount);

    default String determineStatusMessage(StateAccount stateAccount) {
        if (stateAccount != null && stateAccount.getBanUntil() != null &&
                stateAccount.getBanUntil().isAfter(ChronoLocalDate.from(LocalDateTime.now()))) {
            return "Il tuo account è stato bannato fino al " + stateAccount.getBanUntil();
        }
        return "Attivo";
    }
}
