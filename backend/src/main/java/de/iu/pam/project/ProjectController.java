package de.iu.pam.project;

import de.iu.pam.project.dto.MemberResponse;
import de.iu.pam.project.dto.ProjectProgressResponse;
import de.iu.pam.project.dto.ProjectRequest;
import de.iu.pam.project.dto.ProjectResponse;
import de.iu.pam.project.dto.UpdateMembersRequest;
import de.iu.pam.security.AppUserDetails;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/**
 * Projektverwaltung (US-2, US-3, US-6, US-8).
 *
 * <p>Die Autorisierung erfolgt zweistufig: {@code hasRole} prueft, ob die Rolle
 * die Aktion grundsaetzlich erlaubt, {@code @projectAccess} zusaetzlich, ob der
 * Zugriff auf genau dieses Projekt zulaessig ist.</p>
 */
@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @GetMapping
    public List<ProjectResponse> list(@AuthenticationPrincipal AppUserDetails principal,
                                      @RequestParam(required = false) ProjectStatus status) {
        return projectService.findVisible(principal, status);
    }

    @GetMapping("/{id}")
    @PreAuthorize("@projectAccess.canRead(#id)")
    public ProjectResponse get(@PathVariable Long id) {
        return projectService.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN','PROJECT_MANAGER')")
    public ProjectResponse create(@Valid @RequestBody ProjectRequest request) {
        return projectService.create(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("@projectAccess.canManage(#id)")
    public ProjectResponse update(@PathVariable Long id, @Valid @RequestBody ProjectRequest request) {
        return projectService.update(id, request);
    }

    @PostMapping("/{id}/archive")
    @PreAuthorize("@projectAccess.canManage(#id)")
    public ProjectResponse archive(@PathVariable Long id) {
        return projectService.archive(id);
    }

    @PostMapping("/{id}/reactivate")
    @PreAuthorize("@projectAccess.canManage(#id)")
    public ProjectResponse reactivate(@PathVariable Long id) {
        return projectService.reactivate(id);
    }

    @GetMapping("/{id}/members")
    @PreAuthorize("@projectAccess.canRead(#id)")
    public List<MemberResponse> members(@PathVariable Long id) {
        return projectService.findMembers(id);
    }

    @PutMapping("/{id}/members")
    @PreAuthorize("@projectAccess.canManage(#id)")
    public List<MemberResponse> updateMembers(@PathVariable Long id,
                                              @Valid @RequestBody UpdateMembersRequest request) {
        return projectService.updateMembers(id, request);
    }

    @GetMapping("/{id}/progress")
    @PreAuthorize("@projectAccess.canRead(#id)")
    public ProjectProgressResponse progress(@PathVariable Long id) {
        return projectService.calculateProgress(id);
    }
}
