package de.iu.pam.integration;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import de.iu.pam.project.Project;
import de.iu.pam.tenant.Tenant;
import de.iu.pam.user.Role;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;

/**
 * Nachweis der Mandantentrennung.
 *
 * <p>Die Anwendung ist mandantenfaehig <em>vorbereitet</em>. Dieser Test macht
 * aus der Behauptung eine ueberpruefbare Zusicherung: ein Konto aus Mandant A
 * darf unter keinen Umstaenden Daten aus Mandant B erreichen - auch nicht mit
 * der Rolle ADMIN und auch nicht bei direkt geratener ID.</p>
 */
class TenantIsolationIT extends AbstractIntegrationTest {

    @Test
    @DisplayName("Die Projektliste enthält ausschließlich Projekte des eigenen Mandanten")
    void listOnlyContainsOwnTenantProjects() throws Exception {
        Tenant a = createTenant("alpha");
        Tenant b = createTenant("beta");
        createProject(a, "Projekt Alpha");
        createProject(b, "Projekt Beta 1");
        createProject(b, "Projekt Beta 2");
        var adminA = createUser(a, "admin@alpha.de", Role.ADMIN);

        mockMvc.perform(get("/api/projects")
                        .with(SecurityMockMvcRequestPostProcessors.user(principalFor(adminA.getEmail()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name").value("Projekt Alpha"));
    }

    @Test
    @DisplayName("Der direkte Zugriff auf ein fremdes Projekt liefert 404, nicht 403")
    void foreignProjectIsNotFound() throws Exception {
        Tenant a = createTenant("alpha");
        Tenant b = createTenant("beta");
        Project foreign = createProject(b, "Projekt Beta");
        var adminA = createUser(a, "admin@alpha.de", Role.ADMIN);

        // 404 statt 403 ist Absicht: 403 wuerde bestaetigen, dass es ein
        // Projekt mit dieser ID gibt. Ueber fremde Mandanten soll die API
        // nicht einmal die Existenz preisgeben.
        mockMvc.perform(get("/api/projects/" + foreign.getId())
                        .with(SecurityMockMvcRequestPostProcessors.user(principalFor(adminA.getEmail()))))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Aufgaben eines fremden Mandanten sind nicht abrufbar")
    void foreignTasksAreNotReachable() throws Exception {
        Tenant a = createTenant("alpha");
        Tenant b = createTenant("beta");
        Project foreign = createProject(b, "Projekt Beta");
        createTask(b, foreign, "Geheime Aufgabe", de.iu.pam.task.TaskStatus.OPEN);
        var adminA = createUser(a, "admin@alpha.de", Role.ADMIN);

        mockMvc.perform(get("/api/projects/" + foreign.getId() + "/tasks")
                        .with(SecurityMockMvcRequestPostProcessors.user(principalFor(adminA.getEmail()))))
                .andExpect(status().isNotFound());
    }

    private de.iu.pam.security.AppUserDetails principalFor(String email) {
        return new de.iu.pam.security.AppUserDetails(
                userRepository.findByEmail(email).orElseThrow());
    }
}
