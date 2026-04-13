package org.spring.profileservice.dto;

import org.spring.profileservice.utility.GroupType;

public record InvitationEventDTO(
        String email,
        String groupName,
        String token,
        GroupType groupType,
        int memberCount
) {

}