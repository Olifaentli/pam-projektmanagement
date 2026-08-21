package de.iu.pam.common;

/** Fachlicher Fehler: die angeforderte Ressource existiert nicht (HTTP 404). */
public class NotFoundException extends RuntimeException {

    public NotFoundException(String message) {
        super(message);
    }

    public static NotFoundException of(String entity, Long id) {
        return new NotFoundException(entity + " mit ID " + id + " wurde nicht gefunden");
    }
}
