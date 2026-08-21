package de.iu.pam.security.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Anmeldedaten (US-7).
 *
 * @param email    E-Mail-Adresse des Kontos
 * @param password Passwort im Klartext, wird nur zum Vergleich verwendet
 */
public record LoginRequest(
        @NotBlank(message = "E-Mail darf nicht leer sein")
        String email,

        @NotBlank(message = "Passwort darf nicht leer sein")
        String password) {
}
