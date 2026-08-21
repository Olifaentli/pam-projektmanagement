package de.iu.pam.common;

import java.time.Instant;
import java.util.List;
import java.util.Map;

/**
 * Einheitliche Fehlerantwort der REST-API.
 *
 * <p>Der Aufbau folgt der Vorgabe aus Lektion 4.3 des Kursskripts: Zeitstempel,
 * Statuscode, Fehlermeldung und feldbezogene Details - und ausdruecklich
 * <em>keine</em> internen Systeminformationen wie Stacktraces oder Klassennamen.</p>
 *
 * @param timestamp   Zeitpunkt der Fehlerentstehung
 * @param status      HTTP-Statuscode
 * @param error       Kurzbezeichnung des Statuscodes
 * @param message     fuer Endnutzende verstaendliche Meldung
 * @param path        angefragter Pfad
 * @param fieldErrors Validierungsfehler je Feld, leer wenn keine vorliegen
 */
public record ApiError(
        Instant timestamp,
        int status,
        String error,
        String message,
        String path,
        List<FieldError> fieldErrors) {

    /**
     * @param field   Name des fehlerhaften Feldes
     * @param message Grund der Ablehnung
     */
    public record FieldError(String field, String message) {
    }

    public static ApiError of(int status, String error, String message, String path) {
        return new ApiError(Instant.now(), status, error, message, path, List.of());
    }

    public static ApiError withFields(int status, String error, String message, String path,
                                      Map<String, String> fields) {
        List<FieldError> details = fields.entrySet().stream()
                .map(entry -> new FieldError(entry.getKey(), entry.getValue()))
                .toList();
        return new ApiError(Instant.now(), status, error, message, path, details);
    }
}
