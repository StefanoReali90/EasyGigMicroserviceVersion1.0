package org.spring.profileservice.mapper;

import org.mapstruct.*;
import org.spring.profileservice.dto.*;
import org.spring.profileservice.entity.Band;
import org.spring.profileservice.entity.Genre;
import org.spring.profileservice.entity.Photo;
import org.spring.profileservice.entity.User;
import org.spring.profileservice.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring", uses = {TrackMapper.class})
public abstract class BandMapper {

    @Autowired
    protected UserRepository userRepository;


    @Mapping(target = "id", ignore = true)
    @Mapping(target = "city", ignore = true)
    @Mapping(target = "genres", ignore = true)
    @Mapping(target = "tracks", ignore = true)
    @Mapping(target = "photos", ignore = true)
    public abstract Band toEntity(BandRegistrationRequest request);


    @Mapping(target = "cityName", source = "city.name")
    @Mapping(target = "tracks", source = "tracks")
    @Mapping(target = "member", expression = "java(mapMembersToResponses(band.getMembers()))")
    @Mapping(target = "genres", expression = "java(mapGenresToNames(band.getGenres()))")
    @Mapping(target = "photos", source = "photos")
    public abstract BandFullResponse toFullResponse(Band band);

    @Mapping(target = "cityName", source = "city.name")
    @Mapping(target = "primaryGenre", expression = "java(getPrimaryGenreName(band.getGenres()))")
    public abstract BandSearchResponse toSearchResponse(Band band);

    public List<MemberSummaryResponse> mapMembersToResponses(List<User> members) {
        if (members == null) return List.of();

        return members.stream()
                .map(user -> new MemberSummaryResponse(user.getId(), user.getFirstName(), user.getLastName(), user.getRole().toString()))
                .toList();
    }

    protected List<String> mapGenresToNames(List<Genre> genres) {
        if (genres == null) return List.of();
        return genres.stream().map(Genre::getName).collect(Collectors.toList());
    }

    protected String getPrimaryGenreName(List<Genre> genres) {
        if (genres == null || genres.isEmpty()) return "N/A";
        return genres.get(0).getName();
    }

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "city", ignore = true)
    @Mapping(target = "genres", ignore = true)
    public abstract void updateBandFromDto(BandRegistrationRequest dto, @MappingTarget Band band);

    public abstract PhotoResponse toPhotoResponse(Photo photo);

}