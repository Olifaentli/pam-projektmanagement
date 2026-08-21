# ADR-003: Sitzungsbasierte Anmeldung statt HTTP Basic oder JWT

**Status:** angenommen

## Zusammenhang

Zwei User Stories berühren die Anmeldung unmittelbar:

- **US-7:** „Als Benutzer:in möchte ich mich am System **anmelden und abmelden** können."
- **US-8:** „Als Benutzer:in möchte ich nur die Projekte sehen, für die ich berechtigt bin."

Lektion 2.4 des Kursskripts zeigt als Beispiel `httpBasic()` und erwähnt Token als Erweiterung
(„der sich in der Praxis durch Tokens erweitern lässt").

## Erwogene Alternativen

### HTTP Basic — das Beispiel aus dem Skript
**Dafür:** Genau die im Skript gezeigte Lösung, minimaler Code.
**Dagegen, und ausschlaggebend:** Bei Basic Auth sendet der Client die Zugangsdaten bei *jeder*
Anfrage erneut mit. Es gibt keinen serverseitigen Zustand, der beendet werden könnte — ein
„Abmelden" ist damit nicht sinnvoll umsetzbar. Die Story US-7 verlangt es aber ausdrücklich.
Hinzu kommt, dass der Browser bei einer Single-Page-Anwendung einen eigenen Anmeldedialog
einblendet, der sich nicht gestalten lässt.

### JWT (Bearer-Token)
**Dafür:** Zustandslos, passt zur zustandslosen API aus [ADR-001](ADR-001-frontend-react-vs-vaadin.md),
in der Praxis weit verbreitet.
**Dagegen:** Ein ausgestelltes Token bleibt bis zum Ablauf gültig. Ein echtes Abmelden erfordert
zusätzliche Maßnahmen — eine Sperrliste auf dem Server oder sehr kurze Laufzeiten mit
Erneuerungs-Token. Beides führt den Vorteil der Zustandslosigkeit teilweise wieder ad absurdum und
verlangt spürbar mehr Code. Zudem müsste das Token im Browser abgelegt werden: im `localStorage`
ist es für Skripte lesbar und damit ein lohnendes Ziel für Cross-Site Scripting (in Lektion 2.4
ausdrücklich als Angriffsweg beschrieben), in einem Cookie hätte man dieselbe CSRF-Problematik wie
bei der Sitzungslösung, nur mit mehr Eigenbau.

### Sitzung mit Cookie
**Dafür:** Abmelden ist eine einzige Operation — die Sitzung wird ungültig gemacht. Das
`JSESSIONID`-Cookie ist `HttpOnly` und damit für Skripte unerreichbar. Spring Security bringt den
gesamten Mechanismus mit, einschließlich Schutz vor Session Fixation.
**Dagegen:** Der Server hält Zustand, was der reinen Lehre einer zustandslosen REST-API
widerspricht. CSRF muss aktiv behandelt werden, weil der Browser das Cookie automatisch mitsendet.

## Entscheidung

**Sitzungsbasierte Anmeldung über einen eigenen JSON-Endpunkt.**

Konkret: `POST /api/auth/login` authentifiziert über den `AuthenticationManager` und legt den
`SecurityContext` in der Sitzung ab; `POST /api/auth/logout` macht sie ungültig; `GET /api/auth/me`
stellt den Anmeldezustand nach einem Neuladen der Seite wieder her. Passwörter liegen als
BCrypt-Hash vor. CSRF bleibt aktiv, mit dem Token in einem für JavaScript lesbaren Cookie, das der
API-Client als Kopfzeile `X-XSRF-TOKEN` zurücksendet.

Der Formular-Filter von Spring Security wird bewusst *nicht* verwendet: Er antwortet mit
HTTP-Weiterleitungen, eine Single-Page-Anwendung erwartet aber JSON und Statuscodes.

## Folgen

**Positiv:** US-7 ist vollständig und ohne Behelfslösung erfüllt. Der Sicherheitsgewinn gegenüber
dem Skriptbeispiel ist erheblich: HttpOnly-Cookie, BCrypt, Erneuerung der Sitzungs-ID bei der
Anmeldung, aktiver CSRF-Schutz.

**Positiv:** Fehlgeschlagene Anmeldungen liefern für unbekannte Konten und falsche Passwörter exakt
dieselbe Antwort. Die API bestätigt damit nicht, welche E-Mail-Adressen existieren. Ein Test
(`wrongPasswordGivesNeutralMessage`) vergleicht beide Antworten zeichengenau.

**Negativ:** Der Server hält Sitzungszustand. Bei mehreren Instanzen hinter einem Lastverteiler
müssten die Sitzungen geteilt werden — etwa über Spring Session mit Redis. Für den beschriebenen
Betrieb eines mittelständischen Unternehmens ist das absehbar unkritisch, es ist aber die Grenze
dieser Entscheidung und der wahrscheinlichste Grund, sie später zu revidieren.

**Erkenntnis aus der Umsetzung:** Der Schutz vor Session Fixation führte zu einem hartnäckigen
Testfehler. Nach erfolgreicher Anmeldung ist die zuvor bestehende Sitzung ungültig; der Server legt
eine neue an. Ein Browser folgt dem neuen Cookie selbstverständlich, der Test hielt jedoch am alten
Sitzungsobjekt fest und erhielt 401. Der Fehler lag also im Test, nicht im Code — er ist jetzt als
eigener Testfall `loginRotatesSessionId` festgehalten, der die Erneuerung positiv nachweist.
