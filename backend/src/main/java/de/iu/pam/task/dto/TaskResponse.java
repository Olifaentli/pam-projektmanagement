package de.iu.pam.task.dto;

import de.iu.pam.task.Task;
import java.time.Instant;
import java.time.LocalDate;

/** Eine Aufgabe nach aussen, inklusive aufgeloestem Namen des Zustaendigen. */
public record TaskResponse(
        Long id,
        Long projectId,
        String title,
        String description,
        String status,
        String statusLabel,
        Long assigneeId,
        String assigneeName,
        LocalDate dueDate,
        Instant updatedAt) {

    public static TaskResponse from(Task task, String assigneeName) {
        return new TaskResponse(
                task.getId(),
                task.getProjectId(),
                task.getTitle(),
                task.getDescription(),
                task.getStatus().name(),
                task.getStatus().getLabel(),
                task.getAssigneeId(),
                assigneeName,
                task.getDueDate(),
                task.getUpdatedAt());
    }
}
