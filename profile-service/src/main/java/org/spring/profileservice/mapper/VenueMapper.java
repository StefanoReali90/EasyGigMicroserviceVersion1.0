package org.spring.profileservice.mapper;


import org.mapstruct.*;
import org.spring.profileservice.dto.BandRegistrationRequest;
import org.spring.profileservice.dto.VenueRequest;
import org.spring.profileservice.dto.VenueResponse;
import org.spring.profileservice.entity.Address;
import org.spring.profileservice.entity.Band;
import org.spring.profileservice.entity.Venue;

@Mapper(componentModel = "spring")
public interface VenueMapper {

    @Mapping(target = "directorName", expression = "java(venue.getDirector() != null ? venue.getDirector().getFirstName() + \" \" + venue.getDirector().getLastName() : null)")
    @Mapping(target = "fullAddress", expression = "java(formatFullAddress(venue.getAddress()))")
    VenueResponse toResponse(Venue venue);

    default String formatFullAddress(Address address) {
        if (address == null) return null;

        StringBuilder builder = new StringBuilder();
        builder.append(address.getStreet()).append(", ")
                .append(address.getHouseNumber()).append(", ")
                .append(address.getZipCode()).append(" - ");
        if (address.getCity() != null) {
            builder.append(address.getCity().getName());
        }
        return builder.toString();
    }

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "director", ignore = true)
    @Mapping(target = "address", source = ".")
    void updateVenueFromDto(VenueRequest dto, @MappingTarget Venue venue);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "city", ignore = true)
    void updateAddressFromDto(VenueRequest dto, @MappingTarget Address address);
}
