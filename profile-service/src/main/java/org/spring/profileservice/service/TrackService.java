package org.spring.profileservice.service;

import lombok.RequiredArgsConstructor;
import org.spring.profileservice.entity.Band;
import org.spring.profileservice.entity.MusicTrack;
import org.spring.profileservice.entity.User;
import org.spring.profileservice.repository.BandRepository;
import org.spring.profileservice.repository.MusicTrackRepository;
import org.spring.profileservice.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
@RequiredArgsConstructor
public class TrackService {

    private final MusicTrackRepository trackRepository;
    private final CloudinaryService cloudinaryService;
    private final BandRepository bandRepository;
    private final UserRepository userRepository;

    public MusicTrack addExternalTrackToBand(Long bandId, String title, String url) {
        Band band = bandRepository.findById(bandId).orElseThrow();
        MusicTrack track = new MusicTrack();
        track.setTitle(title);
        track.setUrl(url);
        track.setExternal(true);
        band.addTrack(track);
        return trackRepository.save(track);
    }

    public MusicTrack uploadTrackToBand(Long bandId, String title, MultipartFile file) throws IOException {
        Band band = bandRepository.findById(bandId).orElseThrow();
        String url = cloudinaryService.uploadFile(file, "tracks/bands/" + bandId);
        MusicTrack track = new MusicTrack();
        track.setTitle(title);
        track.setUrl(url);
        track.setExternal(false);
        band.addTrack(track);
        return trackRepository.save(track);
    }

    public MusicTrack addExternalTrackToArtist(Long userId, String title, String url) {
        User user = userRepository.findById(userId).orElseThrow();
        MusicTrack track = new MusicTrack();
        track.setTitle(title);
        track.setUrl(url);
        track.setExternal(true);
        user.addTrack(track);
        return trackRepository.save(track);
    }

    public MusicTrack uploadTrackToArtist(Long userId, String title, MultipartFile file) throws IOException {
        User user = userRepository.findById(userId).orElseThrow();
        String url = cloudinaryService.uploadFile(file, "tracks/artists/" + userId);
        MusicTrack track = new MusicTrack();
        track.setTitle(title);
        track.setUrl(url);
        track.setExternal(false);
        user.addTrack(track);
        return trackRepository.save(track);
    }
}
