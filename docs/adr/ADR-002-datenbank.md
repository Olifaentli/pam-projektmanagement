# ADR-002: PostgreSQL im Betrieb, H2 in den Tests

**Status:** angenommen

## Zusammenhang

Das Kursskript nennt bewusst **keine** konkrete Datenbank. Lektion 2.5 führt stattdessen das
objektrelationale Mapping ein: JPA und Hibernate abstrahieren die Datenbank so weit, dass der
Anwendungscode kein SQL enthält. Die Wahl des Produkts ist damit eine eigenständige Entscheidung.

Die Aufgabenstellung verlangt lediglich, dass die Anwendung „Daten persistent speichern kann".

## Erwogene Alternativen

### Nur H2 im Dateimodus
**Dafür:** Kein Installationsaufwand, läuft überall, erfüllt die Anforderung „persistent" wörtlich.
**Dagegen:** H2 ist eine Entwicklungsdatenbank. Für ein Unternehmen, das mehrere Kundenprojekte
parallel führt und perspektivisch mehrere Mandanten anbinden will, wäre sie keine ernsthafte
Grundlage. Die Fallstudie würde damit an der Praxisnähe verlieren, die der Prüfungsleitfaden
ausdrücklich einfordert.

### Nur PostgreSQL, auch in den Tests (via Testcontainers)
**Dafür:** Höchste Aussagekraft der Tests, weil sie gegen dasselbe Produkt laufen wie der Betrieb.
**Dagegen:** Testcontainers setzt eine funktionierende Docker-Umgebung voraus — auf dem
Entwicklungsrechner (Windows/WSL2 ohne aktive Docker-Desktop-Integration) war das nicht gegeben.
Zudem verlängert das Hochfahren eines Containers je Testlauf den Rückkopplungszyklus deutlich.

### MongoDB
Verworfen. Die Daten sind ausgeprägt relational: Projekte, Aufgaben, Personen und deren Zuordnungen
sind über Fremdschlüssel verbunden, und die zentrale Auswertung (Fortschritt je Projekt) ist eine
Aggregation über verknüpfte Datensätze. Ein Dokumentenspeicher würde hier Beziehungen nachbilden
müssen, die eine relationale Datenbank von sich aus beherrscht. Außerdem führt das Kursskript
ausschließlich das *objektrelationale* Mapping ein.

## Entscheidung

**PostgreSQL 16 im Betrieb, H2 im Arbeitsspeicher für die Tests.** Das Schema wird in beiden Fällen
von denselben Flyway-Migrationen erzeugt; H2 läuft im PostgreSQL-Kompatibilitätsmodus.

## Folgen

**Positiv:** Die Testsuite läuft ohne externe Abhängigkeit in wenigen Sekunden und funktioniert
damit auch in der GitHub-Actions-Umgebung ohne Zusatzaufbau.

**Positiv:** Dass derselbe Anwendungscode gegen zwei verschiedene Datenbanken läuft, ist der
praktische Beleg für den Nutzen des ORM aus Lektion 2.5 — und war nicht nur Theorie: Als Docker in
der Entwicklungsumgebung nicht verfügbar war, konnte PostgreSQL ohne jede Codeänderung direkt
installiert werden.

**Negativ und ehrlich zu benennen:** Die Tests laufen nicht gegen das Produktivsystem. Unterschiede
im SQL-Dialekt, im Sperrverhalten oder bei Nebenläufigkeit können dadurch unentdeckt bleiben. Der
PostgreSQL-Kompatibilitätsmodus und `ddl-auto=validate` verkleinern das Risiko, beseitigen es aber
nicht. Für ein produktives Vorhaben wäre eine zusätzliche Teststufe gegen echtes PostgreSQL —
etwa nächtlich in der CI — der nächste sinnvolle Schritt.
