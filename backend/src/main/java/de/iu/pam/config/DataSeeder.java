package de.iu.pam.config;

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
import java.time.LocalDate;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Legt beim Start Beispieldaten an, sofern die Datenbank noch leer ist.
 *
 * <p>Zwei Mandanten sind Absicht: Mandant zwei wird von der Oberflaeche nie
 * angezeigt, existiert aber in der Datenbank. Damit laesst sich die
 * Mandantentrennung praktisch nachweisen, statt sie nur zu behaupten.</p>
 */
@Component
@ConditionalOnProperty(name = "pam.seed.enabled", havingValue = "true")
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);
    private static final String DEFAULT_PASSWORD = "Passwort123!";

    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMembershipRepository membershipRepository;
    private final TaskRepository taskRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(TenantRepository tenantRepository,
                      UserRepository userRepository,
                      ProjectRepository projectRepository,
                      ProjectMembershipRepository membershipRepository,
                      TaskRepository taskRepository,
                      PasswordEncoder passwordEncoder) {
        this.tenantRepository = tenantRepository;
        this.userRepository = userRepository;
        this.projectRepository = projectRepository;
        this.membershipRepository = membershipRepository;
        this.taskRepository = taskRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (tenantRepository.count() > 0) {
            log.info("Beispieldaten bereits vorhanden, Seed wird uebersprungen");
            return;
        }

        Tenant hauptsitz = tenantRepository.save(new Tenant("Musterfirma IT GmbH", "musterfirma"));
        Tenant zweigstelle = tenantRepository.save(new Tenant("Musterfirma Nord GmbH", "nord"));

        seedHauptsitz(hauptsitz);
        seedZweigstelle(zweigstelle);

        log.info("Beispieldaten angelegt. Anmeldung z. B. mit admin@musterfirma.de / {}", DEFAULT_PASSWORD);
    }

    private void seedHauptsitz(Tenant tenant) {
        TenantContext.setTenantId(tenant.getId());
        try {
            User admin = createUser("admin@musterfirma.de", "Alina", "Adam", Role.ADMIN);
            User leitung = createUser("leitung@musterfirma.de", "Pero", "Malic", Role.PROJECT_MANAGER);
            User zweiteLeitung = createUser("pm2@musterfirma.de", "Sanja", "Kern", Role.PROJECT_MANAGER);
            User dev1 = createUser("dev1@musterfirma.de", "Tomas", "Berger", Role.EMPLOYEE);
            User dev2 = createUser("dev2@musterfirma.de", "Nadia", "Falk", Role.EMPLOYEE);
            User dev3 = createUser("dev3@musterfirma.de", "Robin", "Lang", Role.EMPLOYEE);

            Project shop = saveProject("Webshop-Relaunch Kunde Nordlicht",
                    "Ablösung des bestehenden Shopsystems inklusive Datenmigration.",
                    LocalDate.now().minusMonths(2), LocalDate.now().plusMonths(3));
            addMembers(shop, leitung, dev1, dev2);
            createTask(shop, "Anforderungsworkshop durchführen", TaskStatus.DONE, dev1, -30);
            createTask(shop, "Datenmodell für Produktkatalog entwerfen", TaskStatus.DONE, dev2, -20);
            createTask(shop, "Migrationsskript für Bestandsdaten", TaskStatus.DONE, dev1, -10);
            createTask(shop, "Checkout-Prozess implementieren", TaskStatus.IN_PROGRESS, dev2, 7);
            createTask(shop, "Zahlungsanbieter anbinden", TaskStatus.IN_PROGRESS, dev1, 14);
            createTask(shop, "Lasttest der Suchfunktion", TaskStatus.OPEN, null, 21);
            createTask(shop, "Barrierefreiheit prüfen (WCAG 2.1 AA)", TaskStatus.OPEN, dev2, 28);

            Project intranet = saveProject("Intranet-Portal Kunde Sonnenhof",
                    "Neues Mitarbeiterportal mit Single Sign-on.",
                    LocalDate.now().minusMonths(1), LocalDate.now().plusMonths(4));
            addMembers(intranet, zweiteLeitung, dev2, dev3);
            createTask(intranet, "SSO-Anbindung an Active Directory", TaskStatus.DONE, dev3, -5);
            createTask(intranet, "Rechte- und Rollenkonzept abstimmen", TaskStatus.IN_PROGRESS, zweiteLeitung, 10);
            createTask(intranet, "Dokumentenablage konzipieren", TaskStatus.OPEN, dev2, 20);
            createTask(intranet, "Redaktionsoberfläche umsetzen", TaskStatus.OPEN, dev3, 35);
            createTask(intranet, "Schulungsunterlagen erstellen", TaskStatus.OPEN, null, 45);

            Project api = saveProject("Schnittstellen-Modernisierung Kunde Talwerk",
                    "Ablösung der SOAP-Schnittstellen durch eine REST-API.",
                    LocalDate.now().minusWeeks(3), LocalDate.now().plusMonths(2));
            addMembers(api, leitung, dev3);
            createTask(api, "Bestandsschnittstellen inventarisieren", TaskStatus.DONE, dev3, -12);
            createTask(api, "OpenAPI-Spezifikation abstimmen", TaskStatus.DONE, leitung, -4);
            createTask(api, "Ressourcenmodell umsetzen", TaskStatus.IN_PROGRESS, dev3, 9);
            createTask(api, "Fehlerbehandlung vereinheitlichen", TaskStatus.OPEN, dev3, 18);
            createTask(api, "Abschaltung der Altschnittstelle planen", TaskStatus.OPEN, leitung, 40);

            Project archiv = saveProject("Ticketsystem-Ablösung Kunde Weitblick",
                    "Projekt 2025 abgeschlossen, zu Referenzzwecken archiviert.",
                    LocalDate.now().minusMonths(14), LocalDate.now().minusMonths(2));
            archiv.archive();
            projectRepository.save(archiv);
            addMembers(archiv, leitung, dev1);
            createTask(archiv, "Altdaten übernehmen", TaskStatus.DONE, dev1, -300);
            createTask(archiv, "Abnahme mit Kunden durchführen", TaskStatus.DONE, leitung, -70);
            createTask(archiv, "Projektabschlussbericht schreiben", TaskStatus.DONE, leitung, -60);

            // admin ist bewusst keinem Projekt zugeordnet: die Administration
            // verwaltet Konten, nicht Projektinhalte.
            log.debug("Hauptsitz mit {} Benutzern angelegt", 6);
            if (admin.getId() == null) {
                throw new IllegalStateException("Adminkonto wurde nicht gespeichert");
            }
        } finally {
            TenantContext.clear();
        }
    }

    private void seedZweigstelle(Tenant tenant) {
        TenantContext.setTenantId(tenant.getId());
        try {
            User admin = createUser("admin@nord.de", "Björn", "Ohlsen", Role.ADMIN);
            User dev = createUser("dev@nord.de", "Marit", "Sund", Role.EMPLOYEE);

            Project project = saveProject("Standortverwaltung Nord",
                    "Projekt eines zweiten Mandanten. Für Mandant eins unsichtbar.",
                    LocalDate.now().minusWeeks(6), LocalDate.now().plusMonths(6));
            addMembers(project, admin, dev);
            createTask(project, "Standortdaten erfassen", TaskStatus.IN_PROGRESS, dev, 12);
            createTask(project, "Ansprechpartner hinterlegen", TaskStatus.OPEN, dev, 25);
        } finally {
            TenantContext.clear();
        }
    }

    private User createUser(String email, String firstName, String lastName, Role... roles) {
        Set<Role> roleSet = EnumSet.copyOf(List.of(roles));
        return userRepository.save(new User(
                email, passwordEncoder.encode(DEFAULT_PASSWORD), firstName, lastName, roleSet));
    }

    private Project saveProject(String name, String description, LocalDate start, LocalDate end) {
        return projectRepository.save(new Project(name, description, start, end));
    }

    private void addMembers(Project project, User... users) {
        for (User user : users) {
            membershipRepository.save(new ProjectMembership(project.getId(), user.getId()));
        }
    }

    private void createTask(Project project, String title, TaskStatus status, User assignee, int dueInDays) {
        Task task = new Task(project.getId(), title, null,
                assignee == null ? null : assignee.getId(), LocalDate.now().plusDays(dueInDays));
        task.setStatus(status);
        taskRepository.save(task);
    }
}
