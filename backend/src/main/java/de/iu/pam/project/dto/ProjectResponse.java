package de.iu.pam.project.dto;

import de.iu.pam.project.Project;
import java.time.LocalDate;

/**
 * Ein Projekt nach aussen, angereichert um den Fortschritt (US-6), damit die
 * Uebersichtsliste ohne zusaetzlichen Aufruf je Projekt auskommt.
 */
public record ProjectResponse(
        Long id,
        String name,
        String description,
        String status,
        LocalDate startDate,
        LocalDate endDate,
        int memberCount,
        ProjectProgressResponse progress) {

    public static ProjectResponse from(Project project, int memberCount, ProjectProgressResponse progress) {
        return new ProjectResponse(
                project.getId(),
                project.getName(),
                project.getDescription(),
                project.getStatus().name(),
                project.getStartDate(),
                project.getEndDate(),
                memberCount,
                progress);
    }
}
