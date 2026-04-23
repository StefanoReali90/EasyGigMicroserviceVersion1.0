package org.spring.profileservice.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.spring.profileservice.dto.MemberSummaryResponse;
import org.spring.profileservice.dto.OrganizationResponse;
import org.spring.profileservice.entity.BookingOrganization;
import org.spring.profileservice.entity.User;

import java.util.List;

@Mapper(componentModel = "spring")
public interface OrganizationMapper {

    @Mapping(target = "cityName", source = "city.name")
    @Mapping(target = "promoters", expression = "java(mapPromotersToResponses(organization.getPromoters()))")
    OrganizationResponse toResponse(BookingOrganization organization);

    List<OrganizationResponse> toResponseList(List<BookingOrganization> organizations);

    default List<MemberSummaryResponse> mapPromotersToResponses(List<User> promoters) {
        if (promoters == null) return List.of();
        return promoters.stream()
                .map(user -> new MemberSummaryResponse(user.getId(), user.getFirstName(), user.getLastName(), user.getRole().toString()))
                .toList();
    }
}
