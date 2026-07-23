package org.spring.profileservice.service;

import lombok.RequiredArgsConstructor;
import org.spring.profileservice.dto.OrganizationRequest;
import org.spring.profileservice.dto.OrganizationResponse;
import org.spring.profileservice.entity.BookingOrganization;
import org.spring.profileservice.entity.City;
import org.spring.profileservice.entity.User;
import org.spring.profileservice.mapper.OrganizationMapper;
import org.spring.profileservice.repository.BookingOrganizationRepository;
import org.spring.profileservice.repository.CityRepository;
import org.spring.profileservice.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingOrganizationService {

    private final BookingOrganizationRepository organizationRepository;
    private final OrganizationMapper organizationMapper;
    private final CityRepository cityRepository;
    private final UserRepository userRepository;

    @Transactional
    public OrganizationResponse createOrganization(OrganizationRequest request, Long promoterUserId) {
        BookingOrganization org = new BookingOrganization();
        org.setName(request.name());
        org.setPartitaIva(request.partitaIva());
        org.setDescription(request.description());
        org.setType(request.type());
        org.setEventsHistory("");

        if (request.cityId() != null) {
            City city = cityRepository.findById(request.cityId())
                    .orElseThrow(() -> new RuntimeException("Città non trovata con ID: " + request.cityId()));
            org.setCity(city);
        }

        if (promoterUserId != null) {
            User promoter = userRepository.findById(promoterUserId)
                    .orElseThrow(() -> new RuntimeException("Utente promoter non trovato con ID: " + promoterUserId));
            org.addPromoter(promoter);
        }

        BookingOrganization saved = organizationRepository.save(org);
        return organizationMapper.toResponse(saved);
    }

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

    public List<OrganizationResponse> getOrganizationsByUser(Long userId) {
        return organizationRepository.findByPromotersId(userId).stream()
                .map(organizationMapper::toResponse)
                .toList();
    }
}
