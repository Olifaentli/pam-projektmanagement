package de.iu.pam.user.dto;

import de.iu.pam.user.User;
import java.util.List;

/**
 * Benutzerkonto nach aussen. Enthaelt bewusst keinen Passwort-Hash.
 */
public record UserResponse(
        Long id,
        String email,
        String firstName,
        String lastName,
        String fullName,
        boolean enabled,
        List<String> roles) {

    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getFullName(),
                user.isEnabled(),
                user.getRoles().stream().map(Enum::name).sorted().toList());
    }
}
