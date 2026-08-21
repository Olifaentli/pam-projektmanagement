package de.iu.pam.project.dto;

/**
 * Projektfortschritt anhand erledigter Aufgaben (US-6).
 *
 * <p>Der Wert wird bei jedem Abruf aus den Aufgaben berechnet und nicht am
 * Projekt gespeichert. So kann er nicht von der Realitaet abweichen, wenn eine
 * Aufgabe ausserhalb des erwarteten Weges geaendert oder geloescht wird.</p>
 *
 * @param total       Anzahl aller Aufgaben des Projekts
 * @param open        Anzahl offener Aufgaben
 * @param inProgress  Anzahl Aufgaben in Bearbeitung
 * @param done        Anzahl erledigter Aufgaben
 * @param percentDone Anteil erledigter Aufgaben in Prozent, auf ganze Zahl gerundet
 */
public record ProjectProgressResponse(
        long total,
        long open,
        long inProgress,
        long done,
        int percentDone) {

    public static ProjectProgressResponse of(long total, long open, long inProgress, long done) {
        // Ein Projekt ohne Aufgaben hat 0 Prozent - nicht 100. Sonst waeren
        // frisch angelegte Projekte in der Uebersicht faelschlich fertig.
        int percent = total == 0 ? 0 : (int) Math.round(done * 100.0 / total);
        return new ProjectProgressResponse(total, open, inProgress, done, percent);
    }
}
