package de.iu.pam.task;

import de.iu.pam.common.ConflictException;
import de.iu.pam.common.NotFoundException;
import de.iu.pam.project.Project;
import de.iu.pam.project.ProjectService;
import de.iu.pam.task.dto.TaskRequest;
import de.iu.pam.task.dto.TaskResponse;
import de.iu.pam.task.dto.UpdateTaskStatusRequest;
import de.iu.pam.tenant.TenantContext;
import de.iu.pam.user.User;
import de.iu.pam.user.UserRepository;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Geschaeftslogik rund um Aufgaben (US-4, US-5). */
@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectService projectService;
    private final UserRepository userRepository;

    public TaskService(TaskRepository taskRepository,
                       ProjectService projectService,
                       UserRepository userRepository) {
        this.taskRepository = taskRepository;
        this.projectService = projectService;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<TaskResponse> findByProject(Long projectId, TaskStatus status) {
        Long tenantId = TenantContext.requireTenantId();
        projectService.load(projectId);

        List<Task> tasks = status == null
                ? taskRepository.findAllByTenantIdAndProjectIdOrderByCreatedAtAsc(tenantId, projectId)
                : taskRepository.findAllByTenantIdAndProjectIdAndStatusOrderByCreatedAtAsc(
                        tenantId, projectId, status);

        Map<Long, String> names = resolveAssigneeNames(tasks);
        return tasks.stream()
                .map(task -> TaskResponse.from(task, names.get(task.getAssigneeId())))
                .toList();
    }

    @Transactional
    public TaskResponse create(Long projectId, TaskRequest request) {
        Project project = projectService.load(projectId);
        if (project.isArchived()) {
            throw new ConflictException("In einem archivierten Projekt können keine Aufgaben angelegt werden");
        }
        validateAssignee(request.assigneeId());

        Task task = new Task(projectId, request.title().trim(), request.description(),
                request.assigneeId(), request.dueDate());
        return toResponse(taskRepository.save(task));
    }

    @Transactional
    public TaskResponse update(Long id, TaskRequest request) {
        Task task = load(id);
        requireEditableProject(task);
        validateAssignee(request.assigneeId());

        task.setTitle(request.title().trim());
        task.setDescription(request.description());
        task.setAssigneeId(request.assigneeId());
        task.setDueDate(request.dueDate());
        return toResponse(taskRepository.save(task));
    }

    /**
     * Setzt den Status einer Aufgabe (US-5).
     *
     * <p>Es gibt bewusst keine Einschraenkung der erlaubten Uebergaenge: In der
     * Praxis muss eine faelschlich als erledigt markierte Aufgabe direkt wieder
     * geoeffnet werden koennen. Ein starrer Statusautomat waere hier eine
     * Huerde ohne fachlichen Nutzen.</p>
     */
    @Transactional
    public TaskResponse updateStatus(Long id, UpdateTaskStatusRequest request) {
        Task task = load(id);
        requireEditableProject(task);
        task.setStatus(request.status());
        return toResponse(taskRepository.save(task));
    }

    @Transactional
    public void delete(Long id) {
        Task task = load(id);
        requireEditableProject(task);
        taskRepository.delete(task);
    }

    @Transactional(readOnly = true)
    public Long projectIdOf(Long taskId) {
        return load(taskId).getProjectId();
    }

    private Task load(Long id) {
        return taskRepository.findByIdAndTenantId(id, TenantContext.requireTenantId())
                .orElseThrow(() -> NotFoundException.of("Aufgabe", id));
    }

    private void requireEditableProject(Task task) {
        if (projectService.load(task.getProjectId()).isArchived()) {
            throw new ConflictException("Aufgaben eines archivierten Projekts können nicht geändert werden");
        }
    }

    private void validateAssignee(Long assigneeId) {
        if (assigneeId == null) {
            return;
        }
        userRepository.findByIdAndTenantId(assigneeId, TenantContext.requireTenantId())
                .orElseThrow(() -> NotFoundException.of("Benutzer", assigneeId));
    }

    private TaskResponse toResponse(Task task) {
        String name = task.getAssigneeId() == null ? null
                : userRepository.findByIdAndTenantId(task.getAssigneeId(), TenantContext.requireTenantId())
                        .map(User::getFullName)
                        .orElse(null);
        return TaskResponse.from(task, name);
    }

    /** Laedt alle Zustaendigen einer Aufgabenliste in einer Abfrage statt je Aufgabe einzeln. */
    private Map<Long, String> resolveAssigneeNames(List<Task> tasks) {
        List<Long> ids = tasks.stream()
                .map(Task::getAssigneeId)
                .filter(java.util.Objects::nonNull)
                .distinct()
                .toList();
        Map<Long, String> names = new HashMap<>();
        if (!ids.isEmpty()) {
            userRepository.findAllByTenantIdAndIdIn(TenantContext.requireTenantId(), ids)
                    .forEach(user -> names.put(user.getId(), user.getFullName()));
        }
        return names;
    }
}
