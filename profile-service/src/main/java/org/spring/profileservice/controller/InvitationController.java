package org.spring.profileservice.controller;

import lombok.RequiredArgsConstructor;
import org.spring.profileservice.service.InvitationService;
import org.spring.profileservice.utility.GroupType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/invitations")
@RequiredArgsConstructor
public class InvitationController {

    private final InvitationService invitationService;

    @PostMapping("/invite")
    public ResponseEntity<Void> inviteMember(
            @RequestHeader("X-User-Id") Long senderId,
            @RequestParam String email,
            @RequestParam Long groupId,
            @RequestParam GroupType type) {
        invitationService.createInvitation(email, groupId, senderId, type);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/accept")
    public ResponseEntity<Void> acceptInvitation(
            @RequestParam String token,
            @RequestParam Long userId) {
        invitationService.acceptInvitation(token, userId);
        return ResponseEntity.ok().build();
    }
}
