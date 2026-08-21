package de.iu.pam.integration;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import de.iu.pam.project.Project;
import de.iu.pam.security.AppUserDetails;
import de.iu.pam.task.Task;
import de.iu.pam.task.TaskStatus;
import de.iu.pam.tenant.Tenant;
import de.iu.pam.user.Role;
import de.iu.pam.user.User;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

/**
 * Projektsichtbarkeit und Rollenrechte innerhalb eines Mandanten
 * (US-1, US-5, US-6, US-8).
 */
class ProjectVisibilityIT extends AbstractIntegrationTest {

    @Test
    @DisplayName("Mitarbeitende sehen nur die Projekte, denen sie zugeordnet sind")
    void employeeSeesOnlyAssignedProjects() throws Exception {
        Tenant tenant = createTenant("alpha");
        Project assigned = createProject(tenant, "Zugeordnetes Projekt");
        createProject(tenant, "Fremdes Projekt");
        User employee = createUser(tenant, "dev@alpha.de", Role.EMPLOYEE);
        addMember(tenant, assigned, employee);

        mockMvc.perform(get("/api/projects").with(user(principal(employee))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name").value("Zugeordnetes Projekt"));
    }

    @Test
    @DisplayName("Der Direktaufruf eines nicht zugeordneten Projekts wird mit 403 abgewiesen")
    void employeeCannotOpenForeignProject() throws Exception {
        Tenant tenant = createTenant("alpha");
        Project foreign = createProject(tenant, "Fremdes Projekt");
        User employee = createUser(tenant, "dev@alpha.de", Role.EMPLOYEE);

        mockMvc.perform(get("/api/projects/" + foreign.getId()).with(user(principal(employee))))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Die Projektleitung sieht alle Projekte des Mandanten")
    void projectManagerSeesAllProjects() throws Exception {
        Tenant tenant = createTenant("alpha");
        createProject(tenant, "Projekt 1");
        createProject(tenant, "Projekt 2");
        User manager = createUser(tenant, "pm@alpha.de", Role.PROJECT_MANAGER);

        mockMvc.perform(get("/api/projects").with(user(principal(manager))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)));
    }

    @Test
    @DisplayName("Mitarbeitende dürfen kein Projekt anlegen")
    void employeeCannotCreateProject() throws Exception {
        Tenant tenant = createTenant("alpha");
        User employee = createUser(tenant, "dev@alpha.de", Role.EMPLOYEE);

        mockMvc.perform(post("/api/projects")
                        .with(user(principal(employee))).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Neues Projekt\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Mitarbeitende erreichen die Benutzerverwaltung nicht")
    void employeeCannotReachUserAdministration() throws Exception {
        Tenant tenant = createTenant("alpha");
        User employee = createUser(tenant, "dev@alpha.de", Role.EMPLOYEE);

        mockMvc.perform(get("/api/admin/users").with(user(principal(employee))))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Ein Statuswechsel schlägt sich unmittelbar im Fortschritt nieder")
    void statusChangeUpdatesProgress() throws Exception {
        Tenant tenant = createTenant("alpha");
        Project project = createProject(tenant, "Projekt");
        User employee = createUser(tenant, "dev@alpha.de", Role.EMPLOYEE);
        addMember(tenant, project, employee);
        Task first = createTask(tenant, project, "Aufgabe 1", TaskStatus.OPEN);
        createTask(tenant, project, "Aufgabe 2", TaskStatus.OPEN);

        mockMvc.perform(get("/api/projects/" + project.getId() + "/progress")
                        .with(user(principal(employee))))
                .andExpect(jsonPath("$.percentDone").value(0));

        mockMvc.perform(patch("/api/tasks/" + first.getId() + "/status")
                        .with(user(principal(employee))).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"DONE\"}"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/projects/" + project.getId() + "/progress")
                        .with(user(principal(employee))))
                .andExpect(jsonPath("$.done").value(1))
                .andExpect(jsonPath("$.percentDone").value(50));
    }

    @Test
    @DisplayName("Fehlende Pflichtfelder liefern 400 mit feldbezogener Meldung")
    void validationReturnsFieldErrors() throws Exception {
        Tenant tenant = createTenant("alpha");
        User manager = createUser(tenant, "pm@alpha.de", Role.PROJECT_MANAGER);

        mockMvc.perform(post("/api/projects")
                        .with(user(principal(manager))).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"   \"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.timestamp").exists())
                .andExpect(jsonPath("$.fieldErrors[0].field").value("name"))
                // Interne Details duerfen nicht nach aussen gelangen.
                .andExpect(jsonPath("$.trace").doesNotExist())
                .andExpect(jsonPath("$.exception").doesNotExist());
    }

    @Test
    @DisplayName("In einem archivierten Projekt lassen sich keine Aufgaben mehr anlegen")
    void archivedProjectRejectsNewTasks() throws Exception {
        Tenant tenant = createTenant("alpha");
        Project project = createProject(tenant, "Projekt");
        User manager = createUser(tenant, "pm@alpha.de", Role.PROJECT_MANAGER);

        mockMvc.perform(post("/api/projects/" + project.getId() + "/archive")
                        .with(user(principal(manager))).with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ARCHIVED"));

        mockMvc.perform(post("/api/projects/" + project.getId() + "/tasks")
                        .with(user(principal(manager))).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"Neue Aufgabe\"}"))
                .andExpect(status().isConflict());
    }

    private AppUserDetails principal(User user) {
        return new AppUserDetails(userRepository.findById(user.getId()).orElseThrow());
    }
}
