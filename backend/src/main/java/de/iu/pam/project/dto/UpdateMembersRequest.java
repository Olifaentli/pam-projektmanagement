package de.iu.pam.project.dto;

import jakarta.validation.constraints.NotNull;
import java.util.Set;

/**
 * Setzt die Projektmitglieder auf genau die uebergebene Menge (US-3).
 *
 * <p>Bewusst als vollstaendige Ersetzung und nicht als Hinzufuegen/Entfernen
 * modelliert: die Oberflaeche zeigt eine Auswahlliste, deren Zustand direkt
 * uebernommen wird. Das vermeidet Abweichungen bei gleichzeitigen Aenderungen.</p>
 */
public record UpdateMembersRequest(
        @NotNull(message = "Mitgliederliste darf nicht fehlen")
        Set<Long> userIds) {
}
