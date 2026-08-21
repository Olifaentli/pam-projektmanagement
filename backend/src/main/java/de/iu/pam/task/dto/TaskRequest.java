package de.iu.pam.task.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

/** Anlage und Bearbeitung einer Aufgabe (US-4). */
public record TaskRequest(
        @NotBlank(message = "Titel darf nicht leer sein")
        @Size(max = 255, message = "Titel darf höchstens 255 Zeichen lang sein")
        String title,

        @Size(max = 2000, message = "Beschreibung darf höchstens 2000 Zeichen lang sein")
        String description,

        Long assigneeId,

        LocalDate dueDate) {
}
