package org.spring.profileservice.mapper;

import org.mapstruct.*;
import org.spring.profileservice.dto.BandFullResponse;
import org.spring.profileservice.dto.BandRegistrationRequest;
import org.spring.profileservice.dto.BandSearchResponse;
import org.spring.profileservice.entity.Band;
import org.spring.profileservice.entity.Genre;

import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface BandMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "city", ignore = true)
    @Mapping(target = "genres", ignore = true)
    @Mapping(target = "imagePath", ignore = true)
    @Mapping(target = "filepath", ignore = true)
    Band toEntity(BandRegistrationRequest request);

    @Mapping(target = "cityName", source = "city.name")
    @Mapping(target = "genres", expression = "java(getPrimaryGenreName(band.getGenres()))")
    BandFullResponse toFullResponse(Band band);

    @Mapping(target = "cityName", source = "city.name")
    @Mapping(target = "primarygenres", expression = "java(getPrimaryGenreName(band.getGenres()))")
    BandSearchResponse toSearchResponse(Band band);

    default List<String> mapGenresToName(List<Genre> genres) {
        if (genres == null) return null;
        return genres.stream().map(Genre::getName).collect(Collectors.toList());
    }

    default String getPrimaryGenreName(List<Genre> genres) {
        if (genres == null|| genres.isEmpty()) return "N/A";
        return genres.get(0).getName();
    }

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "city", ignore = true)
    @Mapping(target = "genres", ignore = true)
    void updateBandFromDto(BandRegistrationRequest dto, @MappingTarget Band band);



}
