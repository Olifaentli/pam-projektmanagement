package de.iu.pam.task;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskRepository extends JpaRepository<Task, Long> {

    Optional<Task> findByIdAndTenantId(Long id, Long tenantId);

    List<Task> findAllByTenantIdAndProjectIdOrderByCreatedAtAsc(Long tenantId, Long projectId);

    List<Task> findAllByTenantIdAndProjectIdAndStatusOrderByCreatedAtAsc(
            Long tenantId, Long projectId, TaskStatus status);

    /** Grundlage der Fortschrittsberechnung (US-6). */
    long countByTenantIdAndProjectId(Long tenantId, Long projectId);

    long countByTenantIdAndProjectIdAndStatus(Long tenantId, Long projectId, TaskStatus status);

    void deleteAllByTenantIdAndProjectId(Long tenantId, Long projectId);
}
