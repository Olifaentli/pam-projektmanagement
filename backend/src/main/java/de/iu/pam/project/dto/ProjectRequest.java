package de.iu.pam.project.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

/** Anlage und Bearbeitung eines Projekts (US-2). */
public record ProjectRequest(
        @NotBlank(message = "Projektname darf nicht leer sein")
        @Size(max = 255, message = "Projektname darf höchstens 255 Zeichen lang sein")
        String name,

        @Size(max = 2000, message = "Beschreibung darf höchstens 2000 Zeichen lang sein")
        String description,

        LocalDate startDate,

        LocalDate endDate) {
}
