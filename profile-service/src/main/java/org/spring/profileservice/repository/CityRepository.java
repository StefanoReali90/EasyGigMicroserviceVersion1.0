package org.spring.profileservice.repository;

import org.spring.profileservice.entity.City;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CityRepository extends JpaRepository<City, Long> {
    boolean existsByName(String name);
}
