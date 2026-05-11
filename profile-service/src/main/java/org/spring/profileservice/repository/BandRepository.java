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
    @org.springframework.data.jpa.repository.Query("SELECT b FROM Band b JOIN b.members m WHERE m.id = :memberId")
    List<Band> findByMembersId(@org.springframework.data.repository.query.Param("memberId") Long memberId);

    
    List<Band> findByCachetLessThanEqualAndReputationGreaterThanEqual(Integer maxCachet, Double minReputation);
    List<Band> findByNameContainingIgnoreCaseAndCachetLessThanEqualAndReputationGreaterThanEqual(String name, Integer maxCachet, Double minReputation);
    List<Band> findByCityNameIgnoreCaseAndCachetLessThanEqualAndReputationGreaterThanEqual(String cityName, Integer maxCachet, Double minReputation);
    List<Band> findByNameContainingIgnoreCaseAndCityNameIgnoreCaseAndCachetLessThanEqualAndReputationGreaterThanEqual(String name, String city, Integer maxCachet, Double minReputation);

    boolean existsByNameIgnoreCaseAndCityId(String name, Long cityId);
}
