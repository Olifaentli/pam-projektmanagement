package de.iu.pam.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Aenderung von Stammdaten eines Benutzerkontos (US-1). */
public record UpdateUserRequest(
        @NotBlank(message = "Vorname darf nicht leer sein")
        @Size(max = 100, message = "Vorname darf höchstens 100 Zeichen lang sein")
        String firstName,

        @NotBlank(message = "Nachname darf nicht leer sein")
        @Size(max = 100, message = "Nachname darf höchstens 100 Zeichen lang sein")
        String lastName,

        boolean enabled) {
}
