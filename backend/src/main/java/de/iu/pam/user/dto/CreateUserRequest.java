package de.iu.pam.user.dto;

import de.iu.pam.user.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import java.util.Set;

/**
 * Anlage eines Benutzerkontos (US-1).
 *
 * <p>Die Bean-Validation-Annotationen werden durch {@code @Valid} im Controller
 * ausgeloest; Verstoesse beantwortet der GlobalExceptionHandler feldbezogen
 * mit HTTP 400 (Lektion 4.2).</p>
 */
public record CreateUserRequest(
        @NotBlank(message = "E-Mail darf nicht leer sein")
        @Email(message = "E-Mail-Adresse ist ungültig")
        String email,

        @NotBlank(message = "Passwort darf nicht leer sein")
        @Size(min = 8, message = "Passwort muss mindestens 8 Zeichen lang sein")
        String password,

        @NotBlank(message = "Vorname darf nicht leer sein")
        @Size(max = 100, message = "Vorname darf höchstens 100 Zeichen lang sein")
        String firstName,

        @NotBlank(message = "Nachname darf nicht leer sein")
        @Size(max = 100, message = "Nachname darf höchstens 100 Zeichen lang sein")
        String lastName,

        @NotEmpty(message = "Mindestens eine Rolle muss vergeben werden")
        Set<Role> roles) {
}
