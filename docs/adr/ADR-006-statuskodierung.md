# ADR-006: Aufgabenstatus doppelt kodieren — Farbe und Symbol

**Status:** angenommen

## Zusammenhang

**US-5:** „Als Mitarbeitender möchte ich den Status einer Aufgabe (offen, in Bearbeitung, erledigt)
ändern können."

Der Status erscheint an vier Stellen: als Spalte im Aufgabenboard, auf der Aufgabenkarte, im
Auswahlfeld zum Ändern und — abgeleitet — im Fortschrittsbalken des Projekts. Er ist damit die am
häufigsten gelesene Information der ganzen Anwendung und braucht eine Darstellung, die auf einen
Blick funktioniert.

## Erwogene Alternativen

### Nur Text
Robust und eindeutig, aber langsam zu erfassen. In einem Board mit zwanzig Karten muss jede
Beschriftung einzeln gelesen werden.

### Nur Farbe — die klassische Ampel
Schnell erfassbar und intuitiv. Aber: Rund acht Prozent der Männer und etwa ein halbes Prozent der
Frauen haben eine Rot-Grün-Sehschwäche. Eine Darstellung, die ihre Bedeutung ausschließlich über
Farbe transportiert, ist für diese Gruppe nicht lesbar. Bei einer Anwendung, die ein ganzes
Entwicklungsteam täglich nutzt, ist das keine theoretische Größe.

Hinzu kommt: Auch ohne Sehschwäche ist Farbe allein mehrdeutig, sobald mehrere Farbsysteme in einer
Oberfläche nebeneinander stehen — Markenfarbe, Warnfarbe, Statusfarbe.

### Farbe und Symbol gemeinsam
Beides zusammen. Die Farbe liefert die schnelle Erfassung, das Symbol die eindeutige Bedeutung. Der
Preis ist etwas mehr Platzbedarf und ein zusätzlicher Gestaltungsaufwand.

## Entscheidung

**Doppelte Kodierung über Farbe und Symbol**, ergänzt um die Beschriftung im Klartext.

Umgesetzt in `StatusIndicator.tsx` mit drei Bausteinen: einem reinen Farbpunkt für beengte Stellen,
einer Plakette mit Symbol für Karten und Listen, sowie der Beschriftung. Die Symbole sind ein
offener Kreis (offen), ein Kreispfeil (in Bearbeitung) und ein Haken (erledigt) — eine Abfolge, die
auch ohne Farbe eine Richtung ergibt.

Die Farbwerte liegen zentral in `STATUS_COLORS` beziehungsweise `STATUS_ACCENT` in `theme.ts`. Damit
bedeutet dieselbe Farbe an jeder Stelle dasselbe: Spaltenkopf, Kartenrahmen, Auswahlfeld,
Fortschrittsbalken und Kennzahlen der Übersicht greifen auf dieselbe Quelle zu.

**„Offen" ist grau, nicht rot.** Eine echte Ampel wäre rot; Rot signalisiert aber einen Fehler oder
eine Überschreitung. Eine noch nicht begonnene Aufgabe ist weder das eine noch das andere, sondern
schlicht neutral. Rot bliebe damit für den Fall frei, in dem es wirklich gebraucht wird — etwa eine
überfällige Aufgabe.

## Folgen

**Positiv:** Der Status ist ohne Farbwahrnehmung erfassbar. Die Beschriftungen bleiben zusätzlich
erhalten, sodass auch Bildschirmleseprogramme die Information erhalten — die Auswahlfelder tragen
ein `aria-label` mit dem Aufgabentitel.

**Positiv:** Die zentrale Farbdefinition hat sich beim zweiten Gestaltungsdurchgang bewährt. Das
Entsättigen der drei Statusfarben war eine Änderung an einer Stelle und wirkte sofort auf alle vier
Verwendungen.

**Negativ:** Die doppelte Kodierung kostet Platz. Auf der Aufgabenkarte trägt deshalb nur das
Auswahlfeld den Punkt, nicht zusätzlich eine Plakette — sonst stünde der Status dreifach auf
derselben Karte. Diese Abwägung musste je Verwendungsstelle einzeln getroffen werden.

**Nicht gelöst:** Die Anwendung wurde nicht mit einem Bildschirmleseprogramm getestet und nicht
gegen die WCAG-Kriterien geprüft. Die getroffenen Maßnahmen folgen bekannten Regeln, sind aber nicht
gemessen. Für eine produktive Anwendung wäre eine Prüfung mit Betroffenen der nächste Schritt.
