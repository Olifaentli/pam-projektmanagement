package de.iu.pam.user.dto;

import de.iu.pam.user.Role;
import jakarta.validation.constraints.NotEmpty;
import java.util.Set;

/** Vergabe von Rollen an ein bestehendes Konto (US-1). */
public record UpdateRolesRequest(
        @NotEmpty(message = "Mindestens eine Rolle muss vergeben werden")
        Set<Role> roles) {
}
