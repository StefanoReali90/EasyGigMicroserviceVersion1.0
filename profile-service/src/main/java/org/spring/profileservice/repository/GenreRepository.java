package org.spring.profileservice.repository;

import org.spring.profileservice.entity.Genre;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GenreRepository extends JpaRepository<Genre, Long> {
     boolean existsByName(String name);

    List<Genre> findAllByIdIn(List<Long> longs);
}
