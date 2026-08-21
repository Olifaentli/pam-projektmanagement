package de.iu.pam.project;

import de.iu.pam.security.AppUserDetails;
import de.iu.pam.tenant.TenantContext;
import de.iu.pam.user.Role;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Entscheidet, ob der angemeldete Benutzer ein konkretes Projekt sehen oder
 * aendern darf (US-8).
 *
 * <p>Rollen allein reichen hier nicht aus: Ob jemand ein Projekt sehen darf,
 * haengt am Objekt selbst, naemlich an der Mitgliedschaft. Die Bean wird
 * deshalb aus {@code @PreAuthorize} heraus aufgerufen
 * ({@code @projectAccess.canRead(#id)}) und ergaenzt die rollenbasierte
 * Absicherung aus der SecurityFilterChain um eine objektbezogene Ebene.</p>
 */
@Service("projectAccess")
public class ProjectAccessService {

    private final ProjectMembershipRepository membershipRepository;

    public ProjectAccessService(ProjectMembershipRepository membershipRepository) {
        this.membershipRepository = membershipRepository;
    }

    /** Lesend: Administration und Projektleitung sehen alles, Mitarbeitende nur ihre Projekte. */
    @Transactional(readOnly = true)
    public boolean canRead(Long projectId) {
        AppUserDetails principal = currentPrincipal();
        if (principal == null) {
            return false;
        }
        if (principal.hasRole(Role.ADMIN) || principal.hasRole(Role.PROJECT_MANAGER)) {
            return true;
        }
        return membershipRepository.existsByTenantIdAndProjectIdAndUserId(
                TenantContext.requireTenantId(), projectId, principal.getUserId());
    }

    /**
     * Schreibend auf Aufgaben: zusaetzlich zur Leseberechtigung muss der
     * Mitarbeitende dem Projekt zugeordnet sein (US-4, US-5).
     */
    @Transactional(readOnly = true)
    public boolean canWriteTasks(Long projectId) {
        return canRead(projectId);
    }

    /** Projektstammdaten und Mitglieder aendern nur Administration und Projektleitung (US-2, US-3). */
    public boolean canManage(Long projectId) {
        AppUserDetails principal = currentPrincipal();
        return principal != null
                && (principal.hasRole(Role.ADMIN) || principal.hasRole(Role.PROJECT_MANAGER));
    }

    private AppUserDetails currentPrincipal() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof AppUserDetails principal) {
            return principal;
        }
        return null;
    }
}
