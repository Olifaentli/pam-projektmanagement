package de.iu.pam.task;

import de.iu.pam.task.dto.TaskRequest;
import de.iu.pam.task.dto.TaskResponse;
import de.iu.pam.task.dto.UpdateTaskStatusRequest;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/**
 * Aufgabenverwaltung (US-4, US-5).
 *
 * <p>Aufgaben werden unterhalb ihres Projekts angelegt und gelesen, weil sie
 * ohne Projekt nicht existieren. Aendernde Zugriffe auf eine einzelne Aufgabe
 * verwenden dagegen die flache Ressource {@code /api/tasks/{id}} - der Client
 * kennt die ID und muesste den Projektpfad sonst nur mitschleppen.</p>
 */
@RestController
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping("/api/projects/{projectId}/tasks")
    @PreAuthorize("@projectAccess.canRead(#projectId)")
    public List<TaskResponse> list(@PathVariable Long projectId,
                                   @RequestParam(required = false) TaskStatus status) {
        return taskService.findByProject(projectId, status);
    }

    @PostMapping("/api/projects/{projectId}/tasks")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("@projectAccess.canWriteTasks(#projectId)")
    public TaskResponse create(@PathVariable Long projectId, @Valid @RequestBody TaskRequest request) {
        return taskService.create(projectId, request);
    }

    @PutMapping("/api/tasks/{id}")
    @PreAuthorize("@projectAccess.canWriteTasks(@taskService.projectIdOf(#id))")
    public TaskResponse update(@PathVariable Long id, @Valid @RequestBody TaskRequest request) {
        return taskService.update(id, request);
    }

    @PatchMapping("/api/tasks/{id}/status")
    @PreAuthorize("@projectAccess.canWriteTasks(@taskService.projectIdOf(#id))")
    public TaskResponse updateStatus(@PathVariable Long id,
                                     @Valid @RequestBody UpdateTaskStatusRequest request) {
        return taskService.updateStatus(id, request);
    }

    @DeleteMapping("/api/tasks/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("@projectAccess.canWriteTasks(@taskService.projectIdOf(#id))")
    public void delete(@PathVariable Long id) {
        taskService.delete(id);
    }
}
