package org.spring.profileservice.repository;

import org.spring.profileservice.entity.Band;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
@Repository
public interface BandRepository extends JpaRepository<Band, Long> {
    List<Band> findByNameContainingIgnoreCase(String name);
    List<Band> findByCityNameIgnoreCase(String cityName);
    List<Band> findByGenresNameIgnoreCase(String genresName);
    List<Band> findByGenresNameIgnoreCaseOrderByReputationDesc(String genresName);
}
