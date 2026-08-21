package de.iu.pam.user;

/**
 * Rollen der Anwendung. Spring Security erwartet das Praefix {@code ROLE_},
 * das beim Aufbau der Authorities ergaenzt wird (vgl. Lektion 2.4).
 */
public enum Role {

    /** Verwaltet Benutzerkonten und Rollen (US-1). */
    ADMIN,

    /** Legt Projekte an, archiviert sie und ordnet Mitarbeitende zu (US-2, US-3). */
    PROJECT_MANAGER,

    /** Arbeitet an Aufgaben der eigenen Projekte (US-4, US-5). */
    EMPLOYEE;

    public String authority() {
        return "ROLE_" + name();
    }
}
