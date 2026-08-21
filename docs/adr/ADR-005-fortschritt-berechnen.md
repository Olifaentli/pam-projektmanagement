# ADR-005: Projektfortschritt berechnen statt speichern

**Status:** angenommen

## Zusammenhang

**US-6:** „Als Projektleiter möchte ich den Fortschritt eines Projekts anhand erledigter Aufgaben
sehen können."

Der Fortschritt erscheint an drei Stellen der Oberfläche: auf der Übersicht, in der Projektliste und
im Projektdetail. Er wird also häufiger gelesen als geschrieben.

## Erwogene Alternativen

### Gespeicherter Wert am Projekt (`percent_done`)
**Dafür:** Ein Lesezugriff ohne Aggregation. Die Projektliste käme mit einer einzigen Abfrage aus.
**Dagegen:** Der Wert muss bei jeder Änderung an jeder Aufgabe nachgeführt werden — beim Anlegen,
beim Statuswechsel, beim Löschen, beim Verschieben zwischen Projekten. Jeder übersehene Pfad führt
zu einem dauerhaft falschen Wert, und zwar zu einem, der glaubwürdig aussieht. Für eine Kennzahl,
auf deren Grundlage eine Projektleitung Entscheidungen trifft, ist das der schlechtere Fehlermodus:
Eine langsame Anzeige fällt auf, eine falsche nicht.

### Berechnung bei jedem Abruf
**Dafür:** Der Wert kann nicht veralten, weil er keine eigene Existenz hat. Es gibt keinen Pfad, der
vergessen werden könnte.
**Dagegen:** Je Projekt sind vier Zählabfragen nötig (gesamt, offen, in Bearbeitung, erledigt). Bei
einer Liste von *n* Projekten ergibt das 4·*n* Abfragen — ein klassisches N+1-Problem.

## Entscheidung

**Berechnung bei jedem Abruf** über `countByTenantIdAndProjectIdAndStatus` im `ProjectService`.

Die Anwendung folgt damit der Regel, abgeleitete Werte nicht zu duplizieren. Der Zielkonflikt wird
klar zugunsten der Korrektheit entschieden: Bei der hier zu erwartenden Größenordnung — Aufgaben je
Projekt im zwei- bis dreistelligen Bereich, Projekte je Mandant im zweistelligen — sind Zählabfragen
günstig, zumal der Index `idx_task_tenant_proj` genau auf `(tenant_id, project_id, status)` liegt
und die Zählung vollständig aus dem Index bedient wird.

## Folgen

**Positiv:** Der Fortschritt stimmt immer. Ein Statuswechsel schlägt sich unmittelbar nieder; ein
Integrationstest (`statusChangeUpdatesProgress`) weist das nach.

**Positiv:** Ein Randfall wurde bewusst festgelegt und getestet: Ein Projekt **ohne** Aufgaben steht
bei 0 %, nicht bei 100 %. Rein mathematisch wären „alle null Aufgaben erledigt" auch als vollständig
lesbar — in der Projektliste würde ein frisch angelegtes Projekt dann als fertig erscheinen. Der
Test `emptyProjectIsZeroPercent` hält diese Festlegung fest.

**Negativ und offen:** Das N+1-Problem besteht. Die Projektliste führt heute je Projekt vier
Zählabfragen plus eine Abfrage der Mitgliederzahl aus. Bei zehn Projekten sind das rund fünfzig
Abfragen — für den beschriebenen Umfang unkritisch, aber keine Lösung, die beliebig mitwächst.

Der nächste Ausbauschritt wäre eine einzelne gruppierende Abfrage
(`SELECT project_id, status, count(*) … GROUP BY project_id, status`), die alle Projekte in einem
Zugriff abdeckt. Das wurde bewusst zurückgestellt: Die jetzige Fassung ist einfacher zu lesen und zu
prüfen, und eine Optimierung ohne gemessenen Engpass wäre eine Annahme statt einer Verbesserung.
Die Stelle ist auf genau eine Methode begrenzt (`ProjectService.toResponse`) und damit ohne
Auswirkung auf den übrigen Code austauschbar.
