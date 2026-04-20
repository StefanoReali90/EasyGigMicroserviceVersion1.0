package org.spring.profileservice.repository;

import org.spring.profileservice.entity.StateAccount;
import org.spring.profileservice.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
@Repository
public interface StateAccountRepository extends JpaRepository<StateAccount,Long> {

    List<StateAccount> findAllByIsBannedTrueAndBanUntilBefore(LocalDate date);
}
