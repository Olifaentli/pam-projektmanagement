package de.iu.pam.project;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProjectRepository extends JpaRepository<Project, Long> {

    Optional<Project> findByIdAndTenantId(Long id, Long tenantId);

    List<Project> findAllByTenantIdOrderByNameAsc(Long tenantId);

    List<Project> findAllByTenantIdAndStatusOrderByNameAsc(Long tenantId, ProjectStatus status);

    /**
     * Projekte, denen der Benutzer zugeordnet ist (US-8). Administratoren und
     * Projektleitungen erhalten stattdessen die vollstaendige Mandantenliste;
     * diese Unterscheidung trifft der Service, nicht das Repository.
     */
    @Query("""
            select p from Project p
            where p.tenantId = :tenantId
              and exists (
                select 1 from ProjectMembership m
                where m.projectId = p.id and m.userId = :userId
              )
            order by p.name asc
            """)
    List<Project> findAllForMember(@Param("tenantId") Long tenantId, @Param("userId") Long userId);

    boolean existsByTenantIdAndNameIgnoreCase(Long tenantId, String name);
}
