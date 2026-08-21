package de.iu.pam.security.dto;

import de.iu.pam.security.AppUserDetails;
import de.iu.pam.user.Role;
import java.util.List;
import java.util.Set;

/**
 * Der angemeldete Benutzer aus Sicht des Frontends.
 *
 * <p>Enthaelt bewusst kein Passwort und keinen Hash - die Entitaet verlaesst
 * den Service-Layer nie, nach aussen geht ausschliesslich dieses DTO.</p>
 */
public record CurrentUserResponse(
        Long id,
        Long tenantId,
        String email,
        String fullName,
        List<String> roles) {

    public static CurrentUserResponse from(AppUserDetails principal) {
        Set<Role> roles = principal.getRoles();
        return new CurrentUserResponse(
                principal.getUserId(),
                principal.getTenantId(),
                principal.getUsername(),
                principal.getFullName(),
                roles.stream().map(Enum::name).sorted().toList());
    }
}
