package org.spring.profileservice.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.spring.profileservice.dto.AccountStatusResponse;
import org.spring.profileservice.entity.StateAccount;
import org.spring.profileservice.entity.User;

import java.time.LocalDateTime;
import java.time.chrono.ChronoLocalDate;

@Mapper(componentModel = "spring")
public interface AccountStatusMapper {

    @Mapping(target = "userId", source = "id")
    @Mapping(target = "statusMessage", expression = "java(determineStatusMessage(user.getStateAccount()))")
    @Mapping(target = "strikes", expression = "java(user.getStateAccount() == null ? 0 : user.getStateAccount().getStrikes())")
    @Mapping(target = "isBanned", expression = "java(user.getStateAccount() == null ? false : user.getStateAccount().isBanned())")
    @Mapping(target = "banUntil", source = "stateAccount.banUntil")
    AccountStatusResponse toResponse(User user);

    default String determineStatusMessage(StateAccount stateAccount) {
        if (stateAccount != null && stateAccount.getBanUntil() != null &&
                stateAccount.getBanUntil().isAfter(ChronoLocalDate.from(LocalDateTime.now()))) {
            return "Il tuo account è stato bannato fino al " + stateAccount.getBanUntil();
        }
        return "Attivo";
    }
}
