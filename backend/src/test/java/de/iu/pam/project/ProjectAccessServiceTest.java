package de.iu.pam.project;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import de.iu.pam.security.AppUserDetails;
import de.iu.pam.tenant.TenantContext;
import de.iu.pam.user.Role;
import de.iu.pam.user.User;
import java.util.Set;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

/**
 * Objektbezogene Zugriffspruefung (US-8).
 *
 * <p>Das Repository ist gemockt: geprueft wird die Entscheidungsregel, nicht
 * die Datenbank.</p>
 */
@ExtendWith(MockitoExtension.class)
class ProjectAccessServiceTest {

    @Mock
    private ProjectMembershipRepository membershipRepository;

    private ProjectAccessService accessService;

    @BeforeEach
    void setUp() {
        accessService = new ProjectAccessService(membershipRepository);
        TenantContext.setTenantId(1L);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
        TenantContext.clear();
    }

    private void authenticateAs(long userId, Role... roles) {
        User user = new User("test@example.de", "hash", "Test", "Person", Set.of(roles));
        user.setId(userId);
        user.setTenantId(1L);
        AppUserDetails principal = new AppUserDetails(user);
        SecurityContextHolder.getContext().setAuthentication(
                UsernamePasswordAuthenticationToken.authenticated(
                        principal, null, principal.getAuthorities()));
    }

    @Test
    @DisplayName("Ohne Anmeldung ist kein Lesezugriff möglich")
    void deniesWhenNotAuthenticated() {
        assertThat(accessService.canRead(1L)).isFalse();
        assertThat(accessService.canManage(1L)).isFalse();
    }

    @Test
    @DisplayName("Die Administration sieht jedes Projekt ohne Mitgliedschaft")
    void adminSeesEverything() {
        authenticateAs(1L, Role.ADMIN);

        assertThat(accessService.canRead(99L)).isTrue();
        // Entscheidend: die Mitgliedschaft wird gar nicht erst abgefragt.
        verify(membershipRepository, never())
                .existsByTenantIdAndProjectIdAndUserId(anyLong(), anyLong(), anyLong());
    }

    @Test
    @DisplayName("Die Projektleitung sieht jedes Projekt des eigenen Mandanten")
    void projectManagerSeesEverything() {
        authenticateAs(2L, Role.PROJECT_MANAGER);

        assertThat(accessService.canRead(99L)).isTrue();
        assertThat(accessService.canManage(99L)).isTrue();
    }

    @Test
    @DisplayName("Mitarbeitende sehen nur Projekte, denen sie zugeordnet sind")
    void employeeSeesOnlyOwnProjects() {
        authenticateAs(3L, Role.EMPLOYEE);
        when(membershipRepository.existsByTenantIdAndProjectIdAndUserId(1L, 7L, 3L)).thenReturn(true);
        when(membershipRepository.existsByTenantIdAndProjectIdAndUserId(1L, 8L, 3L)).thenReturn(false);

        assertThat(accessService.canRead(7L)).isTrue();
        assertThat(accessService.canRead(8L)).isFalse();
    }

    @Test
    @DisplayName("Mitarbeitende dürfen Projektstammdaten auch im eigenen Projekt nicht ändern")
    void employeeCannotManageOwnProject() {
        authenticateAs(3L, Role.EMPLOYEE);

        assertThat(accessService.canManage(7L)).isFalse();
    }
}
