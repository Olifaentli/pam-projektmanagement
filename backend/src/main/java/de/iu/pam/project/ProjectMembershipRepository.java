package de.iu.pam.project;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectMembershipRepository extends JpaRepository<ProjectMembership, Long> {

    List<ProjectMembership> findAllByTenantIdAndProjectId(Long tenantId, Long projectId);

    boolean existsByTenantIdAndProjectIdAndUserId(Long tenantId, Long projectId, Long userId);

    void deleteAllByTenantIdAndProjectId(Long tenantId, Long projectId);

    void deleteAllByTenantIdAndUserId(Long tenantId, Long userId);
}
