package de.iu.pam.integration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import de.iu.pam.tenant.Tenant;
import de.iu.pam.user.Role;
import jakarta.servlet.http.HttpSession;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.MvcResult;

/** An- und Abmeldung über die API (US-7). */
class AuthenticationIT extends AbstractIntegrationTest {

    @Test
    @DisplayName("Ohne Anmeldung liefert die API 401")
    void unauthenticatedRequestIsRejected() throws Exception {
        mockMvc.perform(get("/api/projects"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
    }

    @Test
    @DisplayName("Nach der Anmeldung ist die Sitzung für Folgeaufrufe gültig")
    void loginCreatesUsableSession() throws Exception {
        Tenant tenant = createTenant("alpha");
        createUser(tenant, "admin@alpha.de", Role.ADMIN);

        MvcResult result = login("admin@alpha.de", PASSWORT)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("admin@alpha.de"))
                .andExpect(jsonPath("$.roles[0]").value("ADMIN"))
                // Der Hash darf unter keinen Umständen in der Antwort stehen.
                .andExpect(jsonPath("$.passwordHash").doesNotExist())
                .andReturn();

        mockMvc.perform(get("/api/auth/me").session(sessionOf(result)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("admin@alpha.de"));
    }

    @Test
    @DisplayName("Die Anmeldung erneuert die Sitzungs-ID (Schutz vor Session Fixation)")
    void loginRotatesSessionId() throws Exception {
        Tenant tenant = createTenant("alpha");
        createUser(tenant, "admin@alpha.de", Role.ADMIN);

        MockHttpSession before = new MockHttpSession();
        String idBefore = before.getId();

        MvcResult result = mockMvc.perform(post("/api/auth/login").session(before).with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(credentials("admin@alpha.de", PASSWORT)))
                .andExpect(status().isOk())
                .andReturn();

        // Eine vor der Anmeldung untergeschobene Sitzungs-ID darf danach nicht
        // mehr gelten - sonst könnte ein Angreifer sie vorab festlegen.
        assertThat(before.isInvalid()).isTrue();
        assertThat(sessionOf(result).getId()).isNotEqualTo(idBefore);
    }

    @Test
    @DisplayName("Nach dem Abmelden ist die Sitzung ungültig")
    void logoutInvalidatesSession() throws Exception {
        Tenant tenant = createTenant("alpha");
        createUser(tenant, "admin@alpha.de", Role.ADMIN);

        MvcResult result = login("admin@alpha.de", PASSWORT).andExpect(status().isOk()).andReturn();
        MockHttpSession session = sessionOf(result);

        mockMvc.perform(post("/api/auth/logout").session(session).with(csrf()))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/auth/me").session(session))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Falsche Zugangsdaten verraten nicht, ob das Konto existiert")
    void wrongPasswordGivesNeutralMessage() throws Exception {
        Tenant tenant = createTenant("alpha");
        createUser(tenant, "admin@alpha.de", Role.ADMIN);

        String bekanntesKonto = login("admin@alpha.de", "falsch")
                .andExpect(status().isUnauthorized())
                .andReturn().getResponse().getContentAsString();

        String unbekanntesKonto = login("gibtesnicht@alpha.de", "falsch")
                .andExpect(status().isUnauthorized())
                .andReturn().getResponse().getContentAsString();

        // Beide Antworten müssen bis auf den Zeitstempel identisch sein.
        assertThat(withoutTimestamp(bekanntesKonto)).isEqualTo(withoutTimestamp(unbekanntesKonto));
    }

    @Test
    @DisplayName("Eine Anmeldung ohne Passwort wird als Validierungsfehler abgewiesen")
    void emptyCredentialsAreRejected() throws Exception {
        mockMvc.perform(post("/api/auth/login").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"admin@alpha.de\",\"password\":\"\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors[0].field").value("password"));
    }

    private org.springframework.test.web.servlet.ResultActions login(String email, String password)
            throws Exception {
        return mockMvc.perform(post("/api/auth/login").with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(credentials(email, password)));
    }

    private String credentials(String email, String password) {
        return "{\"email\":\"" + email + "\",\"password\":\"" + password + "\"}";
    }

    /**
     * Liefert die Sitzung, die der Server bei der Anmeldung neu angelegt hat.
     *
     * <p>Wichtig: Nach einer erfolgreichen Anmeldung ist eine zuvor
     * uebergebene Sitzung ungueltig. Ein Browser folgt automatisch dem neuen
     * JSESSIONID-Cookie; im Test muss die neue Sitzung explizit aus dem
     * Ergebnis uebernommen werden.</p>
     */
    private MockHttpSession sessionOf(MvcResult result) {
        HttpSession session = result.getRequest().getSession(false);
        assertThat(session).as("Der Server muss eine Sitzung angelegt haben").isNotNull();
        return (MockHttpSession) session;
    }

    private String withoutTimestamp(String json) {
        return json.replaceAll("\"timestamp\":\"[^\"]+\"", "");
    }
}
