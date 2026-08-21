# Datenbankstruktur

Diese Beschreibung gehört zum Kapitel „Datenbankstruktur" der Fallstudie. Sie bezieht sich auf das
Schema, das die Flyway-Migrationen `V1__schema.sql` und `V2__indexes.sql` erzeugen. Das Diagramm
dazu ist `er-diagramm.png`.

## Vorgehen: Schema aus Migrationen, nicht aus Entitäten

Hibernate könnte das Schema aus den Java-Klassen selbst erzeugen (`ddl-auto=update`). Die Anwendung
verwendet stattdessen bewusst `ddl-auto=validate` und legt jede Tabelle in einer versionierten
Flyway-Migration an. Drei Gründe:

1. **Nachvollziehbarkeit.** Jede Schemaänderung ist eine eigene, datierte Datei im Repository. Der
   Stand der Datenbank lässt sich zu jedem Commit rekonstruieren.
2. **Kontrolle über Details.** Indizes, Namen von Fremdschlüsseln und `ON DELETE`-Verhalten sind
   explizit festgelegt und nicht vom Framework geraten.
3. **Absicherung.** `validate` bricht den Start ab, wenn Entitäten und Schema auseinanderlaufen.
   Ein vergessenes Feld fällt beim Start auf, nicht erst beim ersten Zugriff im Betrieb.

## Tabellen

### `tenant` — Mandant
| Spalte | Typ | Bemerkung |
|---|---|---|
| `id` | BIGINT, PK, identity | |
| `name` | VARCHAR(255), NOT NULL | Anzeigename, z. B. „Musterfirma IT GmbH" |
| `slug` | VARCHAR(255), NOT NULL, UNIQUE | technischer Kurzname |

### `app_user` — Benutzerkonto
| Spalte | Typ | Bemerkung |
|---|---|---|
| `id` | BIGINT, PK, identity | |
| `tenant_id` | BIGINT, NOT NULL, FK → `tenant` | Mandantenzuordnung |
| `email` | VARCHAR(255), NOT NULL, UNIQUE | Anmeldename |
| `password_hash` | VARCHAR(255), NOT NULL | BCrypt, enthält den Salt |
| `first_name`, `last_name` | VARCHAR(255), NOT NULL | |
| `enabled` | BOOLEAN, NOT NULL | gesperrte Konten bleiben erhalten |

Der Tabellenname ist `app_user` und nicht `user`, weil `USER` in PostgreSQL ein reserviertes Wort ist
und sonst überall in Anführungszeichen stehen müsste.

**Die E-Mail ist global eindeutig, nicht je Mandant.** Das ist eine bewusste Einschränkung: Die
Anmeldung findet statt, bevor ein Mandant bekannt ist — er ergibt sich erst aus dem gefundenen Konto.
Ein mandantenweit eindeutiger Schlüssel würde bedeuten, dass Anmeldende ihren Mandanten zusätzlich
angeben müssten. Für den betrachteten Fall eines Unternehmens mit mehreren Standorten ist die
globale Eindeutigkeit die einfachere und für Nutzende angenehmere Lösung. Bei echter
Mehrmandantenfähigkeit über Unternehmensgrenzen hinweg müsste das geändert werden (siehe
[ADR-004](../adr/ADR-004-mandantenfaehigkeit.md)).

### `user_role` — Rollen eines Kontos
| Spalte | Typ | Bemerkung |
|---|---|---|
| `user_id` | BIGINT, PK, FK → `app_user` ON DELETE CASCADE | |
| `role` | VARCHAR(32), PK | `ADMIN`, `PROJECT_MANAGER`, `EMPLOYEE` |

Eigene Tabelle statt einer Spalte, weil ein Konto grundsätzlich mehrere Rollen tragen kann. Die
Oberfläche vergibt zurzeit genau eine Rolle je Konto; das Datenmodell steht dem Ausbau aber nicht im
Weg. Die Rolle wird als Zeichenkette gespeichert, nicht als Ordinalzahl des Java-Enums — sonst würde
das Einfügen eines neuen Enum-Werts in der Mitte alle Bestandsdaten still verschieben.

### `project` — Projekt
| Spalte | Typ | Bemerkung |
|---|---|---|
| `id` | BIGINT, PK, identity | |
| `tenant_id` | BIGINT, NOT NULL, FK → `tenant` | |
| `name` | VARCHAR(255), NOT NULL | |
| `description` | VARCHAR(2000) | optional |
| `status` | VARCHAR(32), NOT NULL | `ACTIVE` oder `ARCHIVED` |
| `start_date`, `end_date` | DATE | optional |
| `created_at` | TIMESTAMP, NOT NULL | |

Archivieren ist ein Statuswechsel, kein Löschen (US-2). Abgeschlossene Projekte bleiben mit ihren
Aufgaben als Referenz erhalten — genau das war der Grund, warum die bisherigen Excel-Tabellen
unübersichtlich wurden.

### `project_membership` — Zuordnung Mitarbeitende zu Projekt
| Spalte | Typ | Bemerkung |
|---|---|---|
| `id` | BIGINT, PK, identity | |
| `tenant_id` | BIGINT, NOT NULL, FK → `tenant` | |
| `project_id` | BIGINT, NOT NULL, FK → `project` ON DELETE CASCADE | |
| `user_id` | BIGINT, NOT NULL, FK → `app_user` ON DELETE CASCADE | |
| | UNIQUE (`project_id`, `user_id`) | verhindert Doppelzuordnung |

Auflösung der n:m-Beziehung zwischen `project` und `app_user` (US-3). Sie ist als eigene Tabelle mit
eigenem Schlüssel modelliert und nicht als reine Verknüpfungstabelle, damit sie später um Attribute
erweitert werden kann — etwa eine Rolle im Projekt oder ein Zuordnungsdatum.

### `task` — Aufgabe
| Spalte | Typ | Bemerkung |
|---|---|---|
| `id` | BIGINT, PK, identity | |
| `tenant_id` | BIGINT, NOT NULL, FK → `tenant` | |
| `project_id` | BIGINT, NOT NULL, FK → `project` ON DELETE CASCADE | |
| `title` | VARCHAR(255), NOT NULL | |
| `description` | VARCHAR(2000) | optional |
| `status` | VARCHAR(32), NOT NULL | `OPEN`, `IN_PROGRESS`, `DONE` (US-5) |
| `assignee_id` | BIGINT, FK → `app_user` | optional, ohne Kaskade |
| `due_date` | DATE | optional |
| `created_at`, `updated_at` | TIMESTAMP, NOT NULL | |

`assignee_id` hat bewusst **kein** `ON DELETE CASCADE`: Wird ein Konto gelöscht, darf die Aufgabe
nicht mitgelöscht werden. Sie ist Arbeitsergebnis des Projekts, nicht Eigentum der Person.

## Indizes

Alle Abfragen der Anwendung sind mandantengebunden, deshalb führt `tenant_id` jeden Index an:

| Index | Spalten | Deckt ab |
|---|---|---|
| `idx_app_user_tenant` | `tenant_id` | Benutzerliste je Mandant |
| `idx_project_tenant` | `tenant_id, status` | Projektliste mit Filter aktiv/archiviert |
| `idx_membership_tenant` | `tenant_id, user_id` | „meine Projekte" (US-8) |
| `idx_membership_proj` | `tenant_id, project_id` | Mitgliederliste eines Projekts |
| `idx_task_tenant_proj` | `tenant_id, project_id, status` | Aufgabenboard und Fortschrittszählung |
| `idx_task_assignee` | `tenant_id, assignee_id` | Aufgaben einer Person |

## Was das Schema bewusst nicht enthält

**Keine Spalte für den Projektfortschritt.** Es wäre naheliegend, an `project` ein Feld
`percent_done` zu hängen. Der Fortschritt wird stattdessen bei jedem Abruf aus den `task.status`-Werten
gezählt (`countByTenantIdAndProjectIdAndStatus`). Ein gespeicherter Wert müsste bei jeder Änderung an
jeder Aufgabe mitgepflegt werden und würde beim ersten übersehenen Pfad — etwa dem Löschen einer
Aufgabe — dauerhaft falsch stehen. Bei der hier zu erwartenden Datenmenge (Aufgaben je Projekt im
zwei- bis dreistelligen Bereich) ist die Zählung günstig und dank `idx_task_tenant_proj` indexgestützt.
Der Zielkonflikt ist damit klar benannt: Korrektheit vor Lesegeschwindigkeit. Bei deutlich größeren
Datenmengen wäre eine materialisierte Sicht die nächste Ausbaustufe.

**Keine Historie.** Wer wann welchen Status gesetzt hat, wird nicht festgehalten. Für die
Nachvollziehbarkeit in einem Dienstleistungsunternehmen — etwa bei Rückfragen zur Abrechnung — wäre
ein Änderungsprotokoll sinnvoll. Es ist als Erweiterung vorgemerkt, aber nicht Teil des geforderten
Funktionsumfangs.

**Keine Löschmarkierung.** Aufgaben werden echt gelöscht. Projekte dagegen werden nur archiviert.
Die Asymmetrie ist Absicht: Eine versehentlich angelegte Aufgabe soll spurlos verschwinden können,
ein Projekt trägt dagegen Arbeitsergebnisse, die erhalten bleiben müssen.
