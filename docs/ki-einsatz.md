# Einsatz von KI-Werkzeugen

Die Aufgabenstellung verlangt, „unter Zuhilfenahme einschlägiger KI-Tools" zu entwickeln und zu
dokumentieren, „wie KI-Tools eingesetzt wurden und welche Erfahrungen dabei gemacht wurden". Dieses
Protokoll ist die Grundlage für das entsprechende Kapitel der Fallstudie.

> **Hinweis:** Dieses Dokument hält fest, was im Projektverlauf tatsächlich geschehen ist. Es ist
> vor der Abgabe auf die eigene Arbeitsweise hin zu prüfen und in eigenen Worten in den Textteil zu
> überführen — schon deshalb, weil jede Ausarbeitung durch eine Plagiatssoftware läuft.

## Eingesetztes Werkzeug

**Claude Code** (Anthropic), ein agentenbasiertes Kommandozeilenwerkzeug, das nicht nur Text
vorschlägt, sondern Dateien liest und schreibt, Befehle ausführt und deren Ausgabe auswertet. Der
Unterschied zu einem reinen Vorschlagswerkzeug wie einer Autovervollständigung ist für die Bewertung
wesentlich: Das Werkzeug konnte Tests selbst ausführen, Fehlermeldungen lesen und daraufhin
nachbessern.

## Wo der Einsatz getragen hat

### Ermittlung des Technologiestacks aus den Kursunterlagen
Die Aufgabenstellung verlangt „den Technologiestack aus dem Skript", benennt ihn aber nicht. Die
Kursunterlagen liegen als PDF vor, und das Lernskript verwendet Schriftarten ohne Zuordnungstabelle
zu lesbaren Zeichen — eine einfache Textextraktion lieferte nur Zeichensalat. Über eine
Häufigkeitsanalyse ließ sich die Zuordnung rekonstruieren (Testwort „Typescript" als Anker), womit
der gesamte Text zugänglich wurde. Ergebnis: Java mit Spring Boot, Maven, Spring Data JPA/Hibernate,
Spring Security sowie wahlweise Vaadin oder React mit MUI. Diese Einordnung ist mit Lektionsangaben
belegt und war die Grundlage für [ADR-001](adr/ADR-001-frontend-react-vs-vaadin.md).

**Bewertung:** Hier lag der größte Nutzen. Die Aufgabe war mechanisch aufwendig, aber klar
umrissen — genau der Zuschnitt, bei dem ein KI-Werkzeug zuverlässig arbeitet.

### Gleichförmiger Code über viele Dateien
Entitäten, Repositories, DTOs, Mapper und Controller folgen je Fachbereich demselben Muster. Solche
Wiederholungen ließen sich schnell und konsistent erzeugen. Auch die durchgängig deutschsprachigen
Kommentare und Validierungsmeldungen blieben ohne Zusatzaufwand einheitlich.

### Testfälle mit Randbedingungen
Bei der Fortschrittsberechnung schlug das Werkzeug von sich aus den Fall „Projekt ohne Aufgaben" vor
— der Fall, der mathematisch mehrdeutig ist und in der Projektliste zu einem sichtbaren Fehler
geführt hätte (siehe [ADR-005](adr/ADR-005-fortschritt-berechnen.md)).

### Reproduzierbare Dokumentationsartefakte
Screenshots und Wireframes entstehen über Skripte (`docs/screenshots/capture.mjs`,
`docs/wireframes/wireframe.py`) statt von Hand. Ändert sich die Oberfläche, genügt ein erneuter Lauf.

## Wo der Einsatz Fehler erzeugt hat

Diese vier Fälle sind ausdrücklich festgehalten, weil sie das Muster zeigen, nach dem die Fehler
auftraten.

### 1. Veralteter Kenntnisstand zu Bibliotheken
Der erzeugte Frontend-Code verwendete die MUI-Schreibweise älterer Hauptversionen
(`justifyContent`, `fontWeight`, `InputLabelProps` direkt am Element). Die installierte Version 9
hat diese Kurzformen entfernt; sie gehören dort nach `sx` beziehungsweise `slotProps`. Ergebnis:
22 Typfehler beim Übersetzen.

**Erkenntnis:** Auffällig war, dass `tsc --noEmit` fehlerfrei durchlief, `npm run build` aber
scheiterte — Letzteres nutzt die strengere Projektkonfiguration. Ein grüner Teilbefehl ist kein
Beleg für einen fehlerfreien Stand.

### 2. Falsche Annahme in einem selbst geschriebenen Test
Der Test `AuthenticationIT` meldete sich an und verwendete anschließend dasselbe Sitzungsobjekt
weiter — was 401 ergab. Ursache war der Schutz vor Session Fixation: Die Anmeldung verwirft die
bestehende Sitzung und legt eine neue an. Ein Browser folgt dem neuen Cookie selbstverständlich, der
Test tat es nicht.

**Erkenntnis:** Der Fehler lag im Test, nicht im Anwendungscode — die manuelle Prüfung über `curl`
hatte längst funktioniert. Ein Testfehler ist nicht automatisch ein Codefehler. Der Fall wurde
anschließend als eigener Testfall `loginRotatesSessionId` festgehalten, der die Erneuerung nun
positiv nachweist.

### 3. Übersehene Berechtigungsgrenze
Der Dialog zur Zuordnung von Mitarbeitenden griff zunächst auf `/api/admin/users` zu — einen
Endpunkt, der der Rolle ADMIN vorbehalten ist. Für die Projektleitung, die diese Zuordnung
tatsächlich vornimmt (US-3), hätte das zu einem 403 geführt. Behoben durch einen eigenen Endpunkt
`GET /api/users`, der nur Name und E-Mail liefert und für ADMIN sowie Projektleitung geöffnet ist.

**Erkenntnis:** Der Fehler entstand, weil Backend und Frontend nacheinander erzeugt wurden und die
Rollenanforderung dazwischen unterging. Zusammenhänge über Systemgrenzen hinweg sind die Stelle, an
der ein KI-Werkzeug am ehesten den Überblick verliert.

### 4. Vermeidbare Nachlässigkeit im Detail
Die Fehlermeldungen im Java-Code waren zunächst mit Umschreibungen statt Umlauten verfasst
(„Fuer diese Aktion fehlt die Berechtigung"). Im Quelltext ist das eine vertretbare Vorsichtsmaßnahme
gegen Kodierungsprobleme — in einer Meldung, die Nutzende zu sehen bekommen, ist es schlicht falsch.
Aufgefallen ist es erst beim Betrachten eines Screenshots.

**Erkenntnis:** Was fachlich funktioniert, muss nicht angemessen sein. Diese Art Fehler findet keine
Testsuite, sondern nur das Anschauen des Ergebnisses.

## Gesamteinschätzung

Das erkennbare Muster: Das Werkzeug war stark bei **klar umrissenen, in sich geschlossenen
Aufgaben** — ein Muster über viele Dateien wiederholen, eine Datenstruktur ableiten, Randfälle zu
einer Rechenregel benennen. Es war schwach, sobald **Wissen über Systemgrenzen hinweg** nötig war
(Fall 3), sobald **aktuelle Versionsstände** eine Rolle spielten (Fall 1) oder sobald es um
**Angemessenheit statt Korrektheit** ging (Fall 4).

Drei Dinge haben sich als praktisch wirksam erwiesen:

1. **Nachweise statt Zusicherungen.** Jede sicherheitsrelevante Aussage wurde in einen Test
   überführt. Die Behauptung „Mandanten sind getrennt" ist wertlos; `TenantIsolationIT` ist es nicht.
2. **Das Ergebnis ansehen, nicht nur die Testausgabe.** Die Screenshots deckten Fall 4 auf, den
   30 grüne Tests nicht bemerkt hatten.
3. **Entscheidungen im Moment festhalten.** Die ADRs entstanden während der Umsetzung. Rückblickend
   erscheint jede Entscheidung alternativlos, weil die verworfenen Wege nicht mehr präsent sind.

**Bewertung der Arbeitsteilung:** Die Verantwortung für das Ergebnis lässt sich nicht delegieren.
Das Werkzeug beschleunigt die Umsetzung erheblich, trifft aber keine Entscheidungen — und wo es
welche zu treffen scheint, sind es Voreinstellungen aus seinen Trainingsdaten, nicht Abwägungen für
den vorliegenden Fall. Die vier dokumentierten Fehler wären ohne Prüfung sämtlich in der Abgabe
gelandet; drei davon hätten funktionierende, aber falsche Software ergeben.

## Protokoll der Arbeitsschritte

| Schritt | Beitrag des Werkzeugs | Notwendige Korrektur |
|---|---|---|
| Kursunterlagen auswerten | Textextraktion aus PDF, Stack hergeleitet | keine |
| Datenmodell und Schema | Entitäten, Flyway-Migrationen, Indizes | keine |
| Sicherheit | SecurityConfig, AuthController, Mandantenfilter | keine |
| REST-API | Services, Controller, DTOs, Validierung | fehlender Endpunkt für Projektleitung (Fall 3) |
| Frontend | Seiten, Routing, Zustandsverwaltung | MUI-v9-Anpassung, 22 Typfehler (Fall 1) |
| Tests | 30 Backend-, 14 Frontend-Tests | falsche Sitzungsannahme im Test (Fall 2) |
| Oberflächentext | deutschsprachige Meldungen | Umlaute in Nutzermeldungen (Fall 4) |
| Diagramme | PlantUML-Quellen für UML und ER | Layout zweimal überarbeitet (Überlappungen) |
