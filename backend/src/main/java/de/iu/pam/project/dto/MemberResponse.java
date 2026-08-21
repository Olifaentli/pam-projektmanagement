package de.iu.pam.project.dto;

import de.iu.pam.user.User;

/** Ein einem Projekt zugeordneter Mitarbeitender (US-3). */
public record MemberResponse(Long userId, String fullName, String email) {

    public static MemberResponse from(User user) {
        return new MemberResponse(user.getId(), user.getFullName(), user.getEmail());
    }
}
