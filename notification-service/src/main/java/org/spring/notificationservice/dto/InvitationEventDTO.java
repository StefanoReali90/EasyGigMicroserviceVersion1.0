package org.spring.notificationservice.dto;

import org.spring.notificationservice.utility.GroupType;

public record InvitationEventDTO(
        String email,
        String groupName,
        String token,
        GroupType groupType,
        int memberCount
) {
}
