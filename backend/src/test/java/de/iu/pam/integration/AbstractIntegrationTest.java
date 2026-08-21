package de.iu.pam.integration;

import de.iu.pam.project.Project;
import de.iu.pam.project.ProjectMembership;
import de.iu.pam.project.ProjectMembershipRepository;
import de.iu.pam.project.ProjectRepository;
import de.iu.pam.task.Task;
import de.iu.pam.task.TaskRepository;
import de.iu.pam.task.TaskStatus;
import de.iu.pam.tenant.Tenant;
import de.iu.pam.tenant.TenantContext;
import de.iu.pam.tenant.TenantRepository;
import de.iu.pam.user.Role;
import de.iu.pam.user.User;
import de.iu.pam.user.UserRepository;
import java.util.Set;
import org.junit.jupiter.api.AfterEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Gemeinsame Basis der Integrationstests.
 *
 * <p>Laeuft gegen H2 statt PostgreSQL. Weil der gesamte Datenzugriff ueber JPA
 * geht, ist der Anwendungscode davon unberuehrt - genau das ist der praktische
 * Nutzen des objektrelationalen Mappings aus Lektion 2.5.</p>
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public abstract class AbstractIntegrationTest {

    protected static final String PASSWORT = "Passwort123!";

    @Autowired
    protected MockMvc mockMvc;

    @Autowired
    protected TenantRepository tenantRepository;
    @Autowired
    protected UserRepository userRepository;
    @Autowired
    protected ProjectRepository projectRepository;
    @Autowired
    protected ProjectMembershipRepository membershipRepository;
    @Autowired
    protected TaskRepository taskRepository;
    @Autowired
    protected PasswordEncoder passwordEncoder;

    @AfterEach
    void cleanDatabase() {
        taskRepository.deleteAll();
        membershipRepository.deleteAll();
        projectRepository.deleteAll();
        userRepository.deleteAll();
        tenantRepository.deleteAll();
        TenantContext.clear();
    }

    protected Tenant createTenant(String slug) {
        return tenantRepository.save(new Tenant("Mandant " + slug, slug));
    }

    protected User createUser(Tenant tenant, String email, Role... roles) {
        return inTenant(tenant, () -> userRepository.save(
                new User(email, passwordEncoder.encode(PASSWORT), "Vor", "Nach", Set.of(roles))));
    }

    protected Project createProject(Tenant tenant, String name) {
        return inTenant(tenant, () -> projectRepository.save(new Project(name, null, null, null)));
    }

    protected void addMember(Tenant tenant, Project project, User user) {
        inTenant(tenant, () -> membershipRepository.save(
                new ProjectMembership(project.getId(), user.getId())));
    }

    protected Task createTask(Tenant tenant, Project project, String title, TaskStatus status) {
        return inTenant(tenant, () -> {
            Task task = new Task(project.getId(), title, null, null, null);
            task.setStatus(status);
            return taskRepository.save(task);
        });
    }

    /** Fuehrt eine Aktion im Mandantenkontext aus und raeumt ihn danach auf. */
    private <T> T inTenant(Tenant tenant, java.util.function.Supplier<T> action) {
        Long previous = TenantContext.getTenantId();
        TenantContext.setTenantId(tenant.getId());
        try {
            return action.get();
        } finally {
            if (previous == null) {
                TenantContext.clear();
            } else {
                TenantContext.setTenantId(previous);
            }
        }
    }

    private void inTenant(Tenant tenant, Runnable action) {
        inTenant(tenant, () -> {
            action.run();
            return null;
        });
    }
}
