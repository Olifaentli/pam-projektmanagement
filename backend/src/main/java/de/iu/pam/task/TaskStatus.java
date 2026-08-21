package de.iu.pam.task;

/**
 * Status einer Aufgabe (US-5). Die Bezeichnungen entsprechen den in der
 * Aufgabenstellung genannten Zustaenden offen, in Bearbeitung und erledigt.
 */
public enum TaskStatus {

    OPEN("offen"),
    IN_PROGRESS("in Bearbeitung"),
    DONE("erledigt");

    private final String label;

    TaskStatus(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
