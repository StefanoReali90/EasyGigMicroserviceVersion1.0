package org.spring.profileservice.repository;

import org.spring.profileservice.entity.City;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CityRepository extends JpaRepository<City, Long> {
    boolean existsByName(String name);
    List<City> findByNameContainingIgnoreCase(String name);
}
