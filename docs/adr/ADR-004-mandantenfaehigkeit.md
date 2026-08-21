# ADR-004: Mandantentrennung über `tenant_id` und Anwendungslogik

**Status:** angenommen

## Zusammenhang

Die Aufgabenstellung verlangt, die Anwendung „mandantenfähig **vorbereitet**" zu gestalten. Das
Wort „vorbereitet" ist entscheidend: Gefordert ist nicht der Vollausbau eines Mehrmandantenbetriebs,
sondern ein Entwurf, der ihn ohne Bruch zulässt.

## Erwogene Alternativen

### Eine Datenbank je Mandant
**Dafür:** Die stärkste denkbare Trennung. Ein Fehler in der Anwendung kann keine Daten über
Mandantengrenzen hinweg preisgeben. Sicherungen und Wiederherstellung sind je Mandant möglich.
**Dagegen:** Erheblicher Betriebsaufwand — jede Schemamigration muss über alle Datenbanken laufen,
Verbindungen müssen dynamisch aufgelöst werden. Für „vorbereitet" weit überzogen.

### Ein Schema je Mandant
Mittelweg. Trennung auf Datenbankebene bei einer gemeinsamen Instanz, aber die Migrationsverwaltung
wird deutlich komplexer. Ebenfalls mehr, als die Aufgabe verlangt.

### Gemeinsames Schema mit `tenant_id` (Discriminator)
**Dafür:** Ein Schema, eine Migrationskette, geringer Betriebsaufwand. Der Ausbau zu einem echten
Mehrmandantenbetrieb ist möglich, ohne das Datenmodell umzubauen.
**Dagegen:** Die Trennung wird von der Anwendung durchgesetzt, nicht von der Datenbank. Eine
vergessene Bedingung in einer Abfrage legt fremde Daten offen. Diese Schwäche muss aktiv
abgesichert werden.

### Umsetzungsvariante: Hibernate-`@Filter` statt expliziter Abfragen
Erwogen und **verworfen**. Ein `@Filter` wirkt elegant, muss aber je Hibernate-Session aktiviert
werden. Diese Aktivierung hängt am Transaktions- und Session-Verlauf und ist in Kombination mit
`open-in-view=false` fehleranfällig. Vor allem aber ist ein Fehler dort still: Ist der Filter nicht
aktiv, liefert die Abfrage einfach alle Mandanten. Explizite Repository-Methoden sind weniger
elegant, dafür im Code sichtbar und einzeln testbar.

## Entscheidung

**Gemeinsames Schema mit `tenant_id` auf jeder fachlichen Tabelle**, durchgesetzt in der
Anwendungsschicht:

1. `BaseTenantEntity` als `@MappedSuperclass` stempelt die `tenant_id` beim Anlegen automatisch aus
   dem `TenantContext` — sie kann an keiner Aufrufstelle vergessen werden.
2. `TenantContext` hält die Mandanten-ID in einem `ThreadLocal`, gesetzt vom `TenantContextFilter`
   je Anfrage.
3. Die ID stammt **ausschließlich** aus dem authentifizierten Principal, nie aus einem Parameter
   oder einer Kopfzeile — sonst wäre sie manipulierbar.
4. Jede Repository-Methode ist mandantengebunden (`findByIdAndTenantId`, `findAllByTenantId`, …).
   Es gibt keine ungefilterte Abfrage auf fachliche Daten.
5. `TenantContext.requireTenantId()` wirft eine Ausnahme, wenn kein Mandant gesetzt ist. Ein
   fehlender Kontext führt so zu einem Fehler und niemals still zu einem Zugriff auf alle Mandanten.

Die Beispieldaten legen **zwei** Mandanten an, von denen die Oberfläche nur einen kennt. Genau das
ist „vorbereitet, aber nicht ausgebaut" — und es macht die Trennung überprüfbar.

## Folgen

**Positiv:** Die Zusicherung ist getestet, nicht behauptet. `TenantIsolationIT` weist nach, dass ein
Konto aus Mandant A die Projekte und Aufgaben aus Mandant B weder auflisten noch über die direkte ID
laden kann — auch nicht mit der Rolle ADMIN.

**Bewusste Feinheit:** Der Zugriff auf einen fremden Mandanten liefert **404**, nicht 403. Ein 403
würde bestätigen, dass ein Datensatz mit dieser ID existiert. Über fremde Mandanten soll die API
nicht einmal die Existenz preisgeben. Innerhalb des eigenen Mandanten ist 403 dagegen richtig und
hilfreich, weil der Datensatz dort tatsächlich existiert und die Meldung verständlich sein soll.

**Negativ:** Die Mandantenbedingung muss in jeder neuen Repository-Methode mitgedacht werden. Ein
`findAll()` ohne Mandantenbezug wäre ein stiller Fehler, den der Compiler nicht bemerkt. Als
Gegenmaßnahme sind die Repository-Schnittstellen bewusst schmal gehalten und mit einem Kommentar
versehen; eine automatisierte Architekturprüfung (etwa mit ArchUnit) wäre der nächste Schritt.

**Negativ und offen:** Die E-Mail-Adresse ist global eindeutig, nicht je Mandant. Das ist eine Folge
der Anmeldung ohne vorherige Mandantenwahl (siehe [schema.md](../er/schema.md)). Bei echter
Mehrmandantenfähigkeit über Unternehmensgrenzen hinweg müsste die Anmeldung um eine Mandantenangabe
erweitert und der Schlüssel auf `(tenant_id, email)` geändert werden.
