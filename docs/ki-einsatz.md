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

### Umsetzung einer Gestaltungsvorlage
Das Erscheinungsbild wurde in zwei Durchgängen überarbeitet. Der zweite folgte einer schriftlichen
Vorlage, die Farbwerte, Schriften, Radien und die gewünschte Wirkung je Seite benannte, ohne Code
vorzugeben. Diese Arbeitsteilung erwies sich als die produktivste des gesamten Projekts: Die
Entscheidung, *wie* die Anwendung aussehen soll, blieb beim Menschen; das Übersetzen in rund
zwanzig Dateien übernahm das Werkzeug. Eine Vorlage in Prosa ist dafür ein besseres Format als eine
Sammlung von Einzelanweisungen, weil sie die Absicht mitliefert — an drei Stellen liess sich die
Vorlage nicht wörtlich umsetzen, und nur weil die Absicht bekannt war, konnte sinnvoll abgewichen
werden (Fälle 5 bis 7).

## Wo der Einsatz Fehler erzeugt hat

Diese sieben Fälle sind ausdrücklich festgehalten, weil sie das Muster zeigen, nach dem die Fehler
auftraten. Die Fälle 1 bis 4 stammen aus der Erstentwicklung, die Fälle 5 bis 7 aus der
Überarbeitung des Erscheinungsbildes.

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

### 5. Vorlage wörtlich genommen statt Absicht verstanden
Die Gestaltungsvorlage schrieb für die Primäraktion einen Farbwechsel über den
Stil-Schlüssel `containedPrimary` vor. Diesen Schlüssel kennt die eingesetzte
Bibliotheksversion nicht mehr — die Umsetzung erzeugte ihn dennoch, weil er in älteren Versionen
üblich war. Der Übersetzer meldete den Fehler sofort.

Schwerwiegender war die Folgekorrektur: Der Ersatzausdruck traf zunächst *jeden* Knopf dieser Art,
auch den deaktivierten. Der Anmelde-Knopf sah damit voll eingefärbt und anklickbar aus, obwohl er
gesperrt war. Kein Test schlug an, denn funktional war alles richtig.

**Erkenntnis:** Derselbe Fehlertyp wie Fall 1, nur eine Ebene höher — diesmal traf ihn nicht der
erzeugte Code, sondern die Vorlage selbst. Auch eine menschliche Vorgabe kann auf einem veralteten
Kenntnisstand beruhen; sie ungeprüft zu übernehmen ist derselbe Fehler wie einem Werkzeug ungeprüft
zu vertrauen.

### 6. Anweisung befolgt, Ergebnis nicht betrachtet
Die Vorlage verlangte den Prozentwert eines Projekts prominent rechts oben auf der Karte. Das wurde
umgesetzt — nur stand er anschließend **zweimal** auf jeder Karte, weil der bestehende
Fortschrittsbalken ihn ohnehin schon anzeigte. Dasselbe galt für die Aufgabenzahl.

**Erkenntnis:** Jede Einzelanweisung war korrekt ausgeführt, das Gesamtergebnis trotzdem falsch.
Aufgefallen ist es erst beim Betrachten des Screenshots, nicht beim Lesen des Codes. Wer eine
Vorlage abarbeitet, prüft leicht nur, ob jeder Punkt erledigt ist — nicht, ob das Ganze noch stimmt.

### 7. Werkzeugartefakt in der Dokumentation
Auf einem der neu erzeugten Screenshots hing ein Tooltip offen, weil der Mauszeiger des
Aufnahmeskripts über einem Element stehen geblieben war. Ein Detail — aber es wäre so in die
Abgabe gewandert. Behoben durch eine Zeile im Aufnahmeskript, die den Zeiger vor jedem Bild
zurücksetzt.

**Erkenntnis:** Automatisch erzeugte Artefakte sind reproduzierbar, aber nicht automatisch richtig.
Auch sie brauchen eine Sichtprüfung.

## Gesamteinschätzung

Das erkennbare Muster: Das Werkzeug war stark bei **klar umrissenen, in sich geschlossenen
Aufgaben** — ein Muster über viele Dateien wiederholen, eine Datenstruktur ableiten, Randfälle zu
einer Rechenregel benennen, eine Gestaltungsvorlage in zwanzig Dateien übersetzen. Es war schwach,
sobald **Wissen über Systemgrenzen hinweg** nötig war (Fall 3), sobald **aktuelle Versionsstände**
eine Rolle spielten (Fälle 1 und 5) und immer dann, wenn nicht die einzelne Anweisung, sondern das
**Gesamtergebnis** zu beurteilen war (Fälle 4, 6 und 7).

Der letzte Punkt ist der wichtigste: Die Fälle 4, 6 und 7 haben gemeinsam, dass jede Einzelvorgabe
korrekt erfüllt war und das Ergebnis trotzdem nicht taugte. Genau diese Klasse von Fehlern findet
keine Testsuite — sie fällt nur auf, wenn man sich das fertige Bild ansieht.

Drei Dinge haben sich als praktisch wirksam erwiesen:

1. **Nachweise statt Zusicherungen.** Jede sicherheitsrelevante Aussage wurde in einen Test
   überführt. Die Behauptung „Mandanten sind getrennt" ist wertlos; `TenantIsolationIT` ist es nicht.
2. **Das Ergebnis ansehen, nicht nur die Testausgabe.** Die Screenshots deckten Fall 4 auf, den
   30 grüne Tests nicht bemerkt hatten.
3. **Entscheidungen im Moment festhalten.** Die ADRs entstanden während der Umsetzung. Rückblickend
   erscheint jede Entscheidung alternativlos, weil die verworfenen Wege nicht mehr präsent sind.
4. **Absicht statt Anweisungsliste übergeben.** Die Gestaltungsvorlage nannte nicht nur Farbwerte,
   sondern auch, was sie bewirken sollen. Nur deshalb liessen sich die drei Stellen, an denen sie
   technisch nicht umsetzbar war, sinnvoll auflösen statt blind zu übernehmen.

**Bewertung der Arbeitsteilung:** Die Verantwortung für das Ergebnis lässt sich nicht delegieren.
Das Werkzeug beschleunigt die Umsetzung erheblich, trifft aber keine Entscheidungen — und wo es
welche zu treffen scheint, sind es Voreinstellungen aus seinen Trainingsdaten, nicht Abwägungen für
den vorliegenden Fall. Die sieben dokumentierten Fehler wären ohne Prüfung sämtlich in der Abgabe
gelandet; fünf davon hätten funktionierende, aber falsche Software ergeben, und nur zwei hätte ein
automatischer Lauf überhaupt bemerkt.

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
| Erscheinungsbild, 1. Runde | Farbschema, Statusampel, Rundungen | Ampelfarbe für "offen" bewusst grau statt rot |
| Erscheinungsbild, 2. Runde | Vorlage in rund 20 Dateien übersetzt | veralteter Stil-Schlüssel, deaktivierter Knopf, doppelter Prozentwert (Fälle 5–7) |
| Veröffentlichung | Repository angelegt, Historie bereinigt | E-Mail-Adresse in drei Commits (siehe unten) |

## Ein Vorfall bei der Veröffentlichung

Das Repository wurde gegen Ende mit Werkzeugunterstützung auf GitHub veröffentlicht. Dabei traten
zwei Dinge auf, die für die Bewertung des Werkzeugeinsatzes aufschlussreicher sind als jeder
Codefehler.

**Erstens** trugen alle Commits zunächst den technischen Benutzernamen der Entwicklungsumgebung
statt einer Person. Das fiel nur auf, weil danach gezielt geprüft wurde. Für eine Arbeit, deren
Versionsgeschichte den Entwicklungsprozess belegen soll, wäre das ein stiller Substanzverlust
gewesen — die Historie hätte formal existiert, aber niemandem zugeordnet werden können.

**Zweitens** entstanden drei Commits aus einer zweiten, parallel laufenden Werkzeugsitzung. Sie
trugen die private E-Mail-Adresse statt der zuvor bewusst gewählten, anonymisierten Adresse und
waren bereits veröffentlicht, bevor das bemerkt wurde. Die Prüfung, ob die Adresse öffentlich sei,
war zunächst gegen den falschen Zweig gelaufen und hatte fälschlich Entwarnung gegeben; erst eine
zweite Prüfung gegen den tatsächlichen Zielzweig deckte es auf. Die Historie liess sich bereinigen,
die alten Einträge bleiben bei GitHub jedoch noch eine Weile über ihre ursprüngliche Kennung
erreichbar.

**Erkenntnis:** Beide Punkte betreffen nicht die erzeugte Software, sondern ihre Umgebung —
Autorenschaft, Nachvollziehbarkeit, Datensparsamkeit. Genau dort ist die Aufmerksamkeit am
geringsten, weil es sich nicht wie Programmieren anfühlt. Und der zweite Punkt zeigt zusätzlich:
Eine Prüfung, die das Falsche misst, ist gefährlicher als gar keine, weil sie Sicherheit vortäuscht.
