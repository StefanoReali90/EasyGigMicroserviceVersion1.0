package org.spring.profileservice.service;

import lombok.RequiredArgsConstructor;
import org.spring.profileservice.dto.OrganizationResponse;
import org.spring.profileservice.entity.BookingOrganization;
import org.spring.profileservice.mapper.OrganizationMapper;
import org.spring.profileservice.repository.BookingOrganizationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingOrganizationService {

    private final BookingOrganizationRepository organizationRepository;
    private final OrganizationMapper organizationMapper;

    public List<OrganizationResponse> searchOrganizations(String name, String city) {
        List<BookingOrganization> organizations;
        if (name != null && !name.isBlank()) {
            organizations = organizationRepository.findByNameContainingIgnoreCase(name);
        } else if (city != null && !city.isBlank()) {
            organizations = organizationRepository.findByCityNameIgnoreCase(city);
        } else {
            organizations = organizationRepository.findAll();
        }
        return organizationMapper.toResponseList(organizations);
    }

    public OrganizationResponse getOrganization(Long id) {
        BookingOrganization organization = organizationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Organizzazione non trovata"));
        return organizationMapper.toResponse(organization);
    }
}
