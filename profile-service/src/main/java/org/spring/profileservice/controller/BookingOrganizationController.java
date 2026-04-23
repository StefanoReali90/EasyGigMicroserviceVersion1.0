package org.spring.profileservice.controller;

import lombok.RequiredArgsConstructor;
import org.spring.profileservice.dto.OrganizationResponse;
import org.spring.profileservice.service.BookingOrganizationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/organizations")
@RequiredArgsConstructor
public class BookingOrganizationController {

    private final BookingOrganizationService organizationService;

    @GetMapping("/search")
    public ResponseEntity<List<OrganizationResponse>> searchOrganizations(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String city
    ) {
        return ResponseEntity.ok(organizationService.searchOrganizations(name, city));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrganizationResponse> getOrganization(@PathVariable Long id) {
        return ResponseEntity.ok(organizationService.getOrganization(id));
    }
}
