# ADR-001: React statt Vaadin als Frontend

**Status:** angenommen

## Zusammenhang

Das Kursskript DLBITOWAWBI01 stellt in Lektion 3 zwei Wege für komponentenbasierte
Benutzeroberflächen vor, die beide zum vorgegebenen Technologiestack gehören:

- **Vaadin** (Lektion 3.2): Die Oberfläche wird vollständig in Java programmiert, der Zustand liegt
  auf dem Server, die Synchronisation übernimmt das Framework.
- **React** (Lektion 3.3): Die Oberfläche läuft im Browser, der Zustand liegt im Client, die
  Kommunikation mit dem Backend erfolgt über eine REST-API.

Beide sind zulässig. Die Wahl musste also fachlich begründet werden.

## Erwogene Alternativen

### Vaadin
**Dafür:** Nur eine Sprache und ein Build-Prozess. Kein REST-Wiring, keine npm-Toolchain, kein
CORS- oder CSRF-Thema zwischen zwei Anwendungen. Für eine Einzelperson mit begrenzter Zeit
spürbar weniger Aufwand. Die Anwendung ist außerdem eine klassische Formular- und
Tabellenanwendung — genau der Anwendungsfall, für den Vaadin gebaut ist.

**Dagegen:** Der serverseitige Zustand skaliert schlechter, weil der Server für jede offene Sitzung
den UI-Zustand vorhält (Lektion 3.3, „Vor- und Nachteile beider Varianten"). Die Product Ownerin
verlangt laut Szenario ausdrücklich eine *skalierbare* Lösung.

### React
**Dafür:** Das Backend bleibt weitgehend zustandslos. Die REST-API ist eine eigenständige
Schnittstelle und könnte später auch eine mobile Anwendung bedienen — bei einem
IT-Dienstleistungsunternehmen mit mehreren Kundenprojekten ein realistisches Szenario. Zudem
deckt diese Variante mehr des Kursstoffs ab: REST-Design und DTOs (Lektion 4), Datenbindung und
Zustandsverwaltung mit `useState`/`useReducer` (Lektion 5) sowie Komponentenbibliotheken
(Lektion 6) kommen nur hier zum Tragen.

**Dagegen:** Zwei Build-Prozesse, zwei Abhängigkeitsbäume, doppelte Modellierung der Datentypen in
Java und TypeScript. Authentifizierung über Sitzungsgrenzen hinweg ist erkennbar aufwendiger.

## Entscheidung

**React mit TypeScript, Vite und der Komponentenbibliothek MUI**, Spring Boot als REST-Backend.

Ausschlaggebend war die Skalierbarkeitsanforderung aus dem Szenario in Verbindung mit der
Abdeckung des Kursstoffs. Die Aufgabenstellung verlangt eine „wartbare, erweiterbare und
skalierbare Lösung"; eine zustandslose API ist dafür die tragfähigere Grundlage.

## Folgen

**Positiv:** Backend und Frontend sind unabhängig testbar und unabhängig austauschbar. Die API ist
über Swagger UI dokumentiert und ohne Oberfläche nutzbar. MUI liefert ein einheitliches
Erscheinungsbild ohne eigenes CSS-Regelwerk (Lektion 6.1).

**Negativ:** Die Datentypen existieren doppelt — als DTO in Java und als Interface in TypeScript.
Ändert sich ein Feld, muss es an zwei Stellen nachgezogen werden; der Compiler bemerkt das nicht.
Eine Codegenerierung aus der OpenAPI-Beschreibung würde das lösen, wurde aber als für den Umfang
dieser Arbeit unverhältnismäßig verworfen.

**Negativ:** Das Zusammenspiel von Session-Cookie und CSRF-Token zwischen zwei Anwendungen war die
fehleranfälligste Stelle der gesamten Umsetzung und musste separat abgesichert werden
(siehe [ADR-003](ADR-003-authentifizierung.md)).

**Aufwand:** Die Anpassung an MUI v9 kostete unerwartet Zeit, weil dort Layout-Kurzschreibweisen
(`justifyContent`, `fontWeight` direkt am Element) entfallen sind und in `sx` beziehungsweise
`slotProps` wandern mussten. Das ist der Preis einer schnelllebigen Bibliothek — bei Vaadin wäre
dieses Problem nicht aufgetreten.
