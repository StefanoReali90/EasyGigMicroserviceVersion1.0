package org.spring.profileservice.controller;

import lombok.RequiredArgsConstructor;
import org.spring.profileservice.dto.OrganizationRequest;
import org.spring.profileservice.dto.OrganizationResponse;
import org.spring.profileservice.service.BookingOrganizationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/organizations")
@RequiredArgsConstructor
public class BookingOrganizationController {

    private final BookingOrganizationService organizationService;

    @PostMapping(path = "/", consumes = "application/json", produces = "application/json")
    public ResponseEntity<OrganizationResponse> createOrganization(
            @RequestBody OrganizationRequest request,
            @RequestHeader(value = "X-User-Id", required = false) Long userIdHeader) {
        Long promoterId = request.promoterId() != null ? request.promoterId() : userIdHeader;
        OrganizationResponse response = organizationService.createOrganization(request, promoterId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

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

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<OrganizationResponse>> getOrganizationsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(organizationService.getOrganizationsByUser(userId));
    }
}
