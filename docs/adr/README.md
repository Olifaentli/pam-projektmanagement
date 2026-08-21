# Architekturentscheidungen (ADRs)

Ein Architecture Decision Record hält eine einzelne Entscheidung fest: den Zusammenhang, die
erwogenen Alternativen, die getroffene Wahl und ihre Folgen — auch die unangenehmen.

Diese Sammlung ist bewusst **während** der Umsetzung entstanden, nicht nachträglich. Der Grund:
Rückblickend wirkt jede Entscheidung alternativlos, weil man die verworfenen Wege nicht mehr vor
Augen hat. Genau diese Wege sind aber das, was eine Fallstudie zeigen soll — der Prüfungsleitfaden
gewichtet „Analyse" und „Ergebnis einschließlich kritischer Reflexion" mit zusammen 50 %.

| Nr. | Entscheidung | Status |
|---|---|---|
| [ADR-001](ADR-001-frontend-react-vs-vaadin.md) | React statt Vaadin als Frontend | angenommen |
| [ADR-002](ADR-002-datenbank.md) | PostgreSQL im Betrieb, H2 in den Tests | angenommen |
| [ADR-003](ADR-003-authentifizierung.md) | Sitzungsbasierte Anmeldung statt HTTP Basic oder JWT | angenommen |
| [ADR-004](ADR-004-mandantenfaehigkeit.md) | Mandantentrennung über `tenant_id` und Anwendungslogik | angenommen |
| [ADR-005](ADR-005-fortschritt-berechnen.md) | Projektfortschritt berechnen statt speichern | angenommen |
