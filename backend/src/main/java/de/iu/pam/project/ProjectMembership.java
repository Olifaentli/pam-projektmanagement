package de.iu.pam.project;

import de.iu.pam.tenant.BaseTenantEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

/**
 * Zuordnung eines Mitarbeitenden zu einem Projekt (US-3).
 *
 * <p>Bewusst als eigene Entitaet und nicht als {@code @ManyToMany} modelliert:
 * so bleibt die Beziehung erweiterbar (etwa um eine Projektrolle oder ein
 * Zuordnungsdatum), ohne das Schema spaeter umbauen zu muessen.</p>
 */
@Entity
@Table(name = "project_membership",
        uniqueConstraints = @UniqueConstraint(columnNames = {"project_id", "user_id"}))
public class ProjectMembership extends BaseTenantEntity {

    @Column(name = "project_id", nullable = false)
    private Long projectId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    protected ProjectMembership() {
    }

    public ProjectMembership(Long projectId, Long userId) {
        this.projectId = projectId;
        this.userId = userId;
    }

    public Long getProjectId() {
        return projectId;
    }

    public Long getUserId() {
        return userId;
    }
}
