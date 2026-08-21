package de.iu.pam.user;

import de.iu.pam.project.dto.MemberResponse;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Lesendes Verzeichnis der Mitarbeitenden des eigenen Mandanten.
 *
 * <p>Bewusst getrennt von der Benutzerverwaltung unter {@code /api/admin}: Um
 * Mitarbeitende einem Projekt zuzuordnen (US-3), braucht die Projektleitung
 * eine Auswahlliste - aber keine Rechte zum Anlegen, Aendern oder Loeschen von
 * Konten. Dieser Endpunkt liefert deshalb nur Name und E-Mail, keine Rollen
 * und keinen Kontostatus.</p>
 */
@RestController
@RequestMapping("/api/users")
public class UserDirectoryController {

    private final UserService userService;

    public UserDirectoryController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','PROJECT_MANAGER')")
    public List<MemberResponse> list() {
        return userService.findDirectory();
    }
}
