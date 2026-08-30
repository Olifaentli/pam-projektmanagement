# PAM — Projekt- und Aufgabenmanagementsystem

Webbasierte Anwendung zur Verwaltung von Projekten, Aufgaben und Mitarbeitenden für ein
mittelständisches IT-Dienstleistungsunternehmen.

Fallstudie zum Kurs **DLBITOWAWBI01 — Programmierung von Web-Anwendungen** (IU Internationale
Hochschule), Aufgabenstellung 1.

## Funktionsumfang

Alle acht User Stories des Product Backlogs sind umgesetzt:

| Nr. | Rolle | Anforderung | Umsetzung |
|---|---|---|---|
| US-1 | Administration | Benutzerkonten anlegen, Rollen vergeben | `/admin/users` |
| US-2 | Projektleitung | Projekte anlegen, bearbeiten, archivieren | `/projects` |
| US-3 | Projektleitung | Mitarbeitende einem Projekt zuordnen | Projektdetail |
| US-4 | Mitarbeitende | Aufgaben erstellen und bearbeiten | Projektdetail |
| US-5 | Mitarbeitende | Aufgabenstatus ändern | Aufgabenboard |
| US-6 | Projektleitung | Projektfortschritt sehen | Fortschrittsbalken |
| US-7 | Alle | Anmelden und abmelden | `/login` |
| US-8 | Alle | Nur berechtigte Projekte sehen | `ProjectAccessService` |

## Technologiestack

Der Stack folgt dem Kursskript; Ergänzungen sind in den [ADRs](docs/adr/) begründet.

**Backend** — Java 21 · Spring Boot 3.3 · Spring MVC · Spring Data JPA/Hibernate ·
Spring Security · Bean Validation · Flyway · Maven
**Frontend** — React 19 · TypeScript · Vite · MUI · React Router · IBM Plex Sans / Space Grotesk
**Datenbank** — PostgreSQL 16 (Betrieb) · H2 (Tests)
**Tests** — JUnit 5 · Mockito · MockMvc · Vitest · React Testing Library

## Architektur

Modularer Monolith in drei Schichten, im Backend nach Fachbereichen geschnitten
(`tenant`, `user`, `project`, `task`). Controller kennen nur DTOs, Services halten die
Geschäftslogik, Repositories kapseln den Datenzugriff. Entitäten verlassen die Serviceschicht nicht.

Die Anwendung ist **mandantenfähig vorbereitet**: Jede fachliche Tabelle trägt eine `tenant_id`,
jede Abfrage ist mandantengebunden, und die Mandanten-ID stammt ausschließlich aus dem
authentifizierten Principal. Details in [ADR-004](docs/adr/ADR-004-mandantenfaehigkeit.md).

Das Erscheinungsbild folgt der Richtung „Kontrast, gedämpft": eine dunkle Navigationsschiene als
einziger großflächig dunkler Bereich, alle Inhaltsflächen hell, starker Kontrast bewusst sparsam —
für Kennzahlen, den aktiven Navigationseintrag und die Primäraktion. Die Aufgabenstatus sind
doppelt kodiert, über Farbe **und** Symbol; die Begründung steht in
[ADR-006](docs/adr/ADR-006-statuskodierung.md).

Diagramme: [Klassendiagramm](docs/uml/klassendiagramm.png) ·
[Komponentendiagramm](docs/uml/komponentendiagramm.png) ·
[ER-Diagramm](docs/er/er-diagramm.png) · [Navigation](docs/navigation.png)

## Lokale Einrichtung

### Voraussetzungen
JDK 21, Maven 3.8+, Node.js 20+, PostgreSQL 16

### Datenbank anlegen
```bash
sudo -u postgres psql -c "CREATE USER pam WITH PASSWORD 'pam';" -c "CREATE DATABASE pam OWNER pam;"
```

### Backend starten
```bash
cd backend && mvn spring-boot:run
```
Läuft auf `http://localhost:8080`. Flyway legt das Schema an, der `DataSeeder` füllt beim ersten
Start Beispieldaten.

### Frontend starten
```bash
cd frontend && npm install && npm run dev
```
Läuft auf `http://localhost:5173` und leitet `/api` per Proxy an das Backend weiter — dadurch
entfällt CORS in der Entwicklung.

### Anmeldung
Alle Beispielkonten verwenden das Passwort `Passwort123!`:

| Konto | Rolle |
|---|---|
| `admin@musterfirma.de` | Administration |
| `leitung@musterfirma.de` | Projektleitung |
| `dev1@musterfirma.de` | Mitarbeitende:r |

Ein zweiter Mandant (`admin@nord.de`) existiert nur in der Datenbank und ist über die Oberfläche
nicht erreichbar. Er belegt die Mandantentrennung.

## Tests

```bash
cd backend && mvn verify
```
30 Tests: 13 Unit-Tests (Surefire) und 17 Integrationstests gegen H2 (Failsafe).
JaCoCo-Bericht unter `backend/target/site/jacoco/`.

```bash
cd frontend && npm test
```
14 Tests mit Vitest und React Testing Library.

Beide Suiten laufen bei jedem Push über [GitHub Actions](.github/workflows/ci.yml).

## API-Dokumentation

Bei laufendem Backend: `http://localhost:8080/swagger-ui.html`

## Dokumentation

Siehe [docs/README.md](docs/README.md) für die vollständige Übersicht der Artefakte —
Diagramme, Wireframes, Screenshots, Architekturentscheidungen und das Protokoll zum KI-Einsatz.

## Projektstruktur

```
backend/     Spring-Boot-Anwendung (Maven)
frontend/    React-Anwendung (Vite)
docs/        Artefakte für die schriftliche Ausarbeitung
doc/         Kursunterlagen der IU (nicht versioniert, urheberrechtlich geschützt)
```
