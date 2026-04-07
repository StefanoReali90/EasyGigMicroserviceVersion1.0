package org.spring.profileservice.mapper;

import org.mapstruct.*;
import org.spring.profileservice.dto.BandFullResponse;
import org.spring.profileservice.dto.BandMemberResponse;
import org.spring.profileservice.dto.BandRegistrationRequest;
import org.spring.profileservice.dto.BandSearchResponse;
import org.spring.profileservice.entity.Band;
import org.spring.profileservice.entity.Genre;
import org.spring.profileservice.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public abstract class BandMapper {

    @Autowired
    protected UserRepository userRepository;


    @Mapping(target = "id", ignore = true)
    @Mapping(target = "city", ignore = true)
    @Mapping(target = "genres", ignore = true)
    @Mapping(target = "imagePath", ignore = true)
    @Mapping(target = "filePath", ignore = true)
    public abstract Band toEntity(BandRegistrationRequest request);


    @Mapping(target = "cityName", source = "city.name")
    @Mapping(target = "members", expression = "java(mapMemberIdsToResponses(band.getMemberIds()))")
    @Mapping(target = "genres", expression = "java(mapGenresToNames(band.getGenres()))")
    public abstract BandFullResponse toFullResponse(Band band);

    @Mapping(target = "cityName", source = "city.name")
    @Mapping(target = "primaryGenre", expression = "java(getPrimaryGenreName(band.getGenres()))")
    public abstract BandSearchResponse toSearchResponse(Band band);

    protected List<BandMemberResponse> mapMemberIdsToResponses(List<Long> memberIds) {
        if (memberIds == null || memberIds.isEmpty()) return List.of();

        return userRepository.findAllById(memberIds).stream()
                .map(user -> new BandMemberResponse(user.getId(), user.getFirstName(), user.getLastName()))
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
}