package org.spring.profileservice.scheduler;

import lombok.RequiredArgsConstructor;
import org.spring.profileservice.entity.StateAccount;
import org.spring.profileservice.repository.BookingOrganizationRepository;
import org.spring.profileservice.repository.StateAccountRepository;
import org.spring.profileservice.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.annotation.AccessType;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
public class AccountScheduler {

    private final StateAccountRepository stateAccountRepository;

    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void checkAndReleaseBans() {
        LocalDate today = LocalDate.now();
        List<StateAccount> expiredBans = stateAccountRepository.findAllByIsBannedTrueAndBanUntilBefore(today);

        for (StateAccount stateAccount : expiredBans) {
            stateAccount.setBanned(false);
            stateAccount.setBanUntil(null);
            stateAccount.setStrikes(0);
        }
        stateAccountRepository.saveAll(expiredBans);
    }




}
