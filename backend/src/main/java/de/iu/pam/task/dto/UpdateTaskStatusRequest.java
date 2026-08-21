package de.iu.pam.task.dto;

import de.iu.pam.task.TaskStatus;
import jakarta.validation.constraints.NotNull;

/** Statuswechsel einer Aufgabe (US-5). */
public record UpdateTaskStatusRequest(
        @NotNull(message = "Status darf nicht fehlen")
        TaskStatus status) {
}
