package de.iu.pam.project;

import de.iu.pam.common.ConflictException;
import de.iu.pam.common.NotFoundException;
import de.iu.pam.project.dto.MemberResponse;
import de.iu.pam.project.dto.ProjectProgressResponse;
import de.iu.pam.project.dto.ProjectRequest;
import de.iu.pam.project.dto.ProjectResponse;
import de.iu.pam.project.dto.UpdateMembersRequest;
import de.iu.pam.security.AppUserDetails;
import de.iu.pam.task.TaskRepository;
import de.iu.pam.task.TaskStatus;
import de.iu.pam.tenant.TenantContext;
import de.iu.pam.user.Role;
import de.iu.pam.user.User;
import de.iu.pam.user.UserRepository;
import java.util.List;
import java.util.Set;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Geschaeftslogik rund um Projekte (US-2, US-3, US-6, US-8). */
@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectMembershipRepository membershipRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    public ProjectService(ProjectRepository projectRepository,
                          ProjectMembershipRepository membershipRepository,
                          TaskRepository taskRepository,
                          UserRepository userRepository) {
        this.projectRepository = projectRepository;
        this.membershipRepository = membershipRepository;
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
    }

    /**
     * Liefert die fuer den angemeldeten Benutzer sichtbaren Projekte (US-8).
     *
     * <p>Die Einschraenkung passiert in der Datenbankabfrage, nicht durch
     * Filtern einer zuvor vollstaendig geladenen Liste. Ein Fehler in der
     * Darstellung kann so keine fremden Projekte offenlegen.</p>
     */
    @Transactional(readOnly = true)
    public List<ProjectResponse> findVisible(AppUserDetails principal, ProjectStatus status) {
        Long tenantId = TenantContext.requireTenantId();
        boolean seesAll = principal.hasRole(Role.ADMIN) || principal.hasRole(Role.PROJECT_MANAGER);

        List<Project> projects;
        if (seesAll) {
            projects = status == null
                    ? projectRepository.findAllByTenantIdOrderByNameAsc(tenantId)
                    : projectRepository.findAllByTenantIdAndStatusOrderByNameAsc(tenantId, status);
        } else {
            projects = projectRepository.findAllForMember(tenantId, principal.getUserId());
            if (status != null) {
                projects = projects.stream().filter(p -> p.getStatus() == status).toList();
            }
        }
        return projects.stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public ProjectResponse findById(Long id) {
        return toResponse(load(id));
    }

    @Transactional
    public ProjectResponse create(ProjectRequest request) {
        validateDates(request);
        Long tenantId = TenantContext.requireTenantId();
        if (projectRepository.existsByTenantIdAndNameIgnoreCase(tenantId, request.name().trim())) {
            throw new ConflictException("Ein Projekt mit diesem Namen existiert bereits");
        }
        Project project = new Project(
                request.name().trim(), request.description(), request.startDate(), request.endDate());
        return toResponse(projectRepository.save(project));
    }

    @Transactional
    public ProjectResponse update(Long id, ProjectRequest request) {
        validateDates(request);
        Project project = load(id);
        if (project.isArchived()) {
            throw new ConflictException("Ein archiviertes Projekt kann nicht bearbeitet werden");
        }
        project.setName(request.name().trim());
        project.setDescription(request.description());
        project.setStartDate(request.startDate());
        project.setEndDate(request.endDate());
        return toResponse(projectRepository.save(project));
    }

    @Transactional
    public ProjectResponse archive(Long id) {
        Project project = load(id);
        if (project.isArchived()) {
            throw new ConflictException("Das Projekt ist bereits archiviert");
        }
        project.archive();
        return toResponse(projectRepository.save(project));
    }

    @Transactional
    public ProjectResponse reactivate(Long id) {
        Project project = load(id);
        project.reactivate();
        return toResponse(projectRepository.save(project));
    }

    @Transactional(readOnly = true)
    public List<MemberResponse> findMembers(Long projectId) {
        Long tenantId = TenantContext.requireTenantId();
        load(projectId);
        List<Long> userIds = membershipRepository
                .findAllByTenantIdAndProjectId(tenantId, projectId)
                .stream()
                .map(ProjectMembership::getUserId)
                .toList();
        if (userIds.isEmpty()) {
            return List.of();
        }
        return userRepository.findAllByTenantIdAndIdIn(tenantId, userIds).stream()
                .sorted((a, b) -> a.getFullName().compareToIgnoreCase(b.getFullName()))
                .map(MemberResponse::from)
                .toList();
    }

    /** Ersetzt die Mitgliederliste eines Projekts (US-3). */
    @Transactional
    public List<MemberResponse> updateMembers(Long projectId, UpdateMembersRequest request) {
        Long tenantId = TenantContext.requireTenantId();
        Project project = load(projectId);
        if (project.isArchived()) {
            throw new ConflictException("Bei einem archivierten Projekt können keine Mitglieder geändert werden");
        }

        Set<Long> requested = request.userIds();
        if (!requested.isEmpty()) {
            // Sicherstellen, dass alle IDs zum eigenen Mandanten gehoeren.
            // Ohne diese Pruefung liesse sich ueber die API ein Konto eines
            // fremden Mandanten in ein Projekt einschleusen.
            List<User> found = userRepository.findAllByTenantIdAndIdIn(tenantId, requested);
            if (found.size() != requested.size()) {
                throw new NotFoundException("Mindestens ein Benutzerkonto wurde nicht gefunden");
            }
        }

        membershipRepository.deleteAllByTenantIdAndProjectId(tenantId, projectId);
        membershipRepository.flush();
        requested.forEach(userId ->
                membershipRepository.save(new ProjectMembership(projectId, userId)));

        return findMembers(projectId);
    }

    /** Berechnet den Fortschritt eines Projekts aus dem Status seiner Aufgaben (US-6). */
    @Transactional(readOnly = true)
    public ProjectProgressResponse calculateProgress(Long projectId) {
        Long tenantId = TenantContext.requireTenantId();
        long total = taskRepository.countByTenantIdAndProjectId(tenantId, projectId);
        long open = taskRepository.countByTenantIdAndProjectIdAndStatus(tenantId, projectId, TaskStatus.OPEN);
        long inProgress = taskRepository.countByTenantIdAndProjectIdAndStatus(
                tenantId, projectId, TaskStatus.IN_PROGRESS);
        long done = taskRepository.countByTenantIdAndProjectIdAndStatus(tenantId, projectId, TaskStatus.DONE);
        return ProjectProgressResponse.of(total, open, inProgress, done);
    }

    /** Wird vom TaskService benoetigt, um die Existenz des Projekts zu pruefen. */
    @Transactional(readOnly = true)
    public Project load(Long id) {
        return projectRepository.findByIdAndTenantId(id, TenantContext.requireTenantId())
                .orElseThrow(() -> NotFoundException.of("Projekt", id));
    }

    private ProjectResponse toResponse(Project project) {
        Long tenantId = TenantContext.requireTenantId();
        int memberCount = membershipRepository
                .findAllByTenantIdAndProjectId(tenantId, project.getId()).size();
        return ProjectResponse.from(project, memberCount, calculateProgress(project.getId()));
    }

    private void validateDates(ProjectRequest request) {
        if (request.startDate() != null && request.endDate() != null
                && request.endDate().isBefore(request.startDate())) {
            throw new ConflictException("Das Enddatum darf nicht vor dem Startdatum liegen");
        }
    }
}
