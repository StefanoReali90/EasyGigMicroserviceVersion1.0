package org.spring.profileservice.repository;

import org.spring.profileservice.entity.MusicTrack;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MusicTrackRepository extends JpaRepository<MusicTrack, Long> {
}
