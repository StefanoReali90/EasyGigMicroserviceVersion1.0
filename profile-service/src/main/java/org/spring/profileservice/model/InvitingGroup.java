package org.spring.profileservice.model;

import org.spring.profileservice.entity.User;

import java.util.List;

public interface InvitingGroup {
    Long getId();
    String getName();
    List<User> getMembers();
    void addMember(User user);

}
