package de.iu.pam.common;

/** Fachlicher Fehler: die Anfrage widerspricht dem aktuellen Zustand (HTTP 409). */
public class ConflictException extends RuntimeException {

    public ConflictException(String message) {
        super(message);
    }
}
