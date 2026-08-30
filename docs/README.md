# Dokumentation

Artefakte für die schriftliche Ausarbeitung der Fallstudie. Die Aufgabenstellung verlangt in
Punkt 3 den Nachweis, wie die Webseiten gestaltet sind, wie die Datenbankstruktur aussieht, wie die
Architektur gestaltet ist (mindestens ein UML-Strukturdiagramm), wie die Softwarequalität
sichergestellt wurde und wie KI-Werkzeuge eingesetzt wurden.

## Zuordnung zu den Anforderungen

| Anforderung | Artefakt |
|---|---|
| Webseiten im **Entwurf** | [`wireframes/`](wireframes/) — sechs Seiten als SVG und PNG |
| Webseiten als **Screenshot** | [`screenshots/`](screenshots/) — zwölf Aufnahmen |
| Navigation zwischen den Seiten | [`navigation.png`](navigation.png) |
| Datenbankstruktur | [`er/er-diagramm.png`](er/er-diagramm.png), [`er/schema.md`](er/schema.md) |
| **UML-Strukturdiagramm** (Pflicht) | [`uml/klassendiagramm.png`](uml/klassendiagramm.png) |
| Softwarearchitektur | [`uml/komponentendiagramm.png`](uml/komponentendiagramm.png) |
| Sicherung der Softwarequalität | Testsuiten, CI-Workflow, JaCoCo-Bericht |
| Einsatz von KI-Werkzeugen | [`ki-einsatz.md`](ki-einsatz.md) |
| Begründung der Entscheidungen | [`adr/`](adr/) — fünf Architecture Decision Records |

## Zum Verhältnis von Entwurf und Umsetzung

Die Wireframes zeigen den Stand **vor** der Implementierung und wurden bewusst **nicht**
nachträglich an das fertige Erscheinungsbild angeglichen. Ein Entwurf, der exakt dem Ergebnis
entspricht, ist kein Entwurf mehr, sondern eine nachgezeichnete Umsetzung — und die Aufgabenstellung
verlangt ausdrücklich beides nebeneinander.

Die Abweichungen sind damit selbst ein Ergebnis und gehören in den Textteil. Die wesentlichen:

| Entwurf | Umsetzung | Grund |
|---|---|---|
| helle Seitennavigation, Nutzer in der Kopfleiste | dunkle Navigationsschiene, Nutzer an deren Fuß | ein einziger dunkler Bereich gibt der Seite Halt; die Kopfleiste wird dadurch frei |
| Fortschritt und Team in zwei Karten | eine gemeinsame Karte, Team als Initialen | beides beschreibt denselben Gegenstand und war unnötig auf zwei Flächen verteilt |
| Aufgabenkarte mit farbigem Balken links | feiner Rahmen in der Spaltenfarbe | die Spaltenfläche kodiert den Status bereits; der Balken doppelte ihn |
| Fälligkeit im Fließtext der Karte | eigenes Datums-Chip rechts unten | Termin ist die am häufigsten gesuchte Angabe und braucht einen festen Platz |
| Projektliste ohne Prozentwert im Kopf | Prozentwert rechts oben neben dem Namen | schnellster Anker beim Überfliegen einer Liste |

## Artefakte neu erzeugen

Alle Artefakte sind reproduzierbar. Ändert sich die Anwendung, genügt ein erneuter Lauf.

**Diagramme** (PlantUML, benötigt Java und Graphviz):
```bash
npm run diagramme
```

**Wireframes** (SVG erzeugen und als PNG rendern):
```bash
npm run wireframes
```

**Screenshots** (benötigt laufendes Backend auf `:8080` und Vite auf `:5173`):
```bash
npm run screenshots
```

## Hinweise zur Verwendung im Textteil

- Die PNG-Dateien liegen in doppelter Auflösung vor und eignen sich für den Ausdruck.
- Die SVG-Dateien skalieren verlustfrei, werden aber je nach Word-Version unterschiedlich
  zuverlässig eingebettet.
- Der Textteil umfasst laut Prüfungsleitfaden 7–10 Seiten. Abbildungen und Verzeichnisse zählen
  nicht dazu; eine Auswahl der Screenshots gehört in den Anhang, nicht alle zwölf in den Fließtext.
- [`ki-einsatz.md`](ki-einsatz.md) und die ADRs sind Arbeitsgrundlage, kein fertiger Text. Sie sind
  vor der Abgabe in eigenen Worten in den Textteil zu überführen.
