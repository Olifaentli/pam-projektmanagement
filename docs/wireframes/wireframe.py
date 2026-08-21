#!/usr/bin/env python3
"""
Erzeugt die Wireframes (Entwuerfe) der sechs Webseiten als SVG.

Die Aufgabenstellung verlangt, jede Seite "im Entwurf und anhand von Screenshots
in der tatsaechlichen Umsetzung" zu zeigen. Diese Wireframes sind der Entwurf;
die Screenshots liegen in docs/screenshots/.

Bewusst grau und ohne Farbe gehalten: Ein Wireframe soll Struktur, Anordnung und
Navigationswege klaeren, nicht das spaetere Aussehen vorwegnehmen.

Aufruf:  python3 docs/wireframes/wireframe.py
"""

W, H = 1000, 640
GREY_LINE = "#9AA3AE"
GREY_FILL = "#EDEFF2"
GREY_DARK = "#5B6570"
TEXT = "#2B3138"


def esc(s: str) -> str:
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


class Wire:
    def __init__(self, title: str, subtitle: str = ""):
        self.parts: list[str] = []
        self.title = title
        self.subtitle = subtitle

    def box(self, x, y, w, h, fill=GREY_FILL, dash=None, rx=4):
        d = f' stroke-dasharray="{dash}"' if dash else ""
        self.parts.append(
            f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" '
            f'fill="{fill}" stroke="{GREY_LINE}" stroke-width="1.5"{d}/>'
        )

    def text(self, x, y, s, size=13, weight="normal", fill=TEXT, anchor="start"):
        self.parts.append(
            f'<text x="{x}" y="{y}" font-family="Segoe UI, Arial, sans-serif" '
            f'font-size="{size}" font-weight="{weight}" fill="{fill}" '
            f'text-anchor="{anchor}">{esc(s)}</text>'
        )

    def line(self, x1, y1, x2, y2, dash=None):
        d = f' stroke-dasharray="{dash}"' if dash else ""
        self.parts.append(
            f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" '
            f'stroke="{GREY_LINE}" stroke-width="1.5"{d}/>'
        )

    def placeholder(self, x, y, w, h, label=""):
        """Platzhalterflaeche mit Diagonalkreuz - Konvention fuer 'Inhalt folgt'."""
        self.box(x, y, w, h, fill="#F7F8FA")
        self.line(x, y, x + w, y + h)
        self.line(x + w, y, x, y + h)
        if label:
            self.text(x + w / 2, y + h / 2 + 4, label, size=12, fill=GREY_DARK, anchor="middle")

    def field(self, x, y, w, label, h=34):
        self.text(x, y - 6, label, size=11, fill=GREY_DARK)
        self.box(x, y, w, h, fill="#FFFFFF")

    def button(self, x, y, w, label, h=34, primary=True):
        self.box(x, y, w, h, fill=GREY_DARK if primary else "#FFFFFF")
        self.text(x + w / 2, y + h / 2 + 4, label, size=12, weight="600",
                  fill="#FFFFFF" if primary else TEXT, anchor="middle")

    def note(self, x, y, s, size=11):
        self.text(x, y, s, size=size, fill=GREY_DARK)

    def render(self) -> str:
        head = (
            f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" '
            f'viewBox="0 0 {W} {H}">'
            f'<rect width="{W}" height="{H}" fill="#FFFFFF"/>'
        )
        title = (
            f'<text x="24" y="30" font-family="Segoe UI, Arial, sans-serif" font-size="16" '
            f'font-weight="700" fill="{TEXT}">{esc(self.title)}</text>'
        )
        sub = ""
        if self.subtitle:
            sub = (
                f'<text x="24" y="49" font-family="Segoe UI, Arial, sans-serif" font-size="12" '
                f'fill="{GREY_DARK}">{esc(self.subtitle)}</text>'
            )
        return head + title + sub + "".join(self.parts) + "</svg>"


def chrome(w: Wire, active: str, admin: bool = True):
    """Kopfleiste und Seitennavigation, die auf allen angemeldeten Seiten gleich sind."""
    w.box(24, 66, W - 48, 44, fill=GREY_FILL)
    w.text(40, 93, "Projekt- und Aufgabenmanagement", size=13, weight="600")
    w.text(W - 250, 93, "Name der Person", size=11, fill=GREY_DARK)
    w.button(W - 130, 78, 80, "Abmelden", h=22, primary=False)

    # Die Seitennavigation endet oberhalb des Anmerkungsbereichs, damit
    # Erläuterungen zum Entwurf nicht in die Navigation hineinlaufen.
    w.box(24, 110, 170, 420, fill="#FFFFFF")
    items = ["Übersicht", "Projekte"] + (["Benutzerverwaltung"] if admin else [])
    for i, item in enumerate(items):
        y = 128 + i * 36
        if item == active:
            w.box(30, y, 158, 30, fill=GREY_FILL)
        w.text(44, y + 20, item, size=12,
               weight="600" if item == active else "normal")
    if admin:
        w.note(30, 128 + len(items) * 36 + 16, "(nur Rolle ADMIN)")


def seite_anmeldung():
    w = Wire("Entwurf 1 — Anmeldung  (/login)", "US-7: Am System anmelden")
    w.box(330, 110, 340, 400, fill="#FFFFFF")
    w.text(360, 155, "Anmeldung", size=18, weight="700")
    w.note(360, 176, "Projekt- und Aufgabenmanagement")
    w.field(360, 210, 280, "E-Mail")
    w.field(360, 285, 280, "Passwort")
    w.button(360, 345, 280, "Anmelden")
    w.box(360, 400, 280, 84, fill="#F7F8FA", dash="4 3")
    w.note(374, 424, "Hinweisfeld mit Testkonten")
    w.note(374, 444, "(nur in der Entwicklungsumgebung)")
    w.note(24, 560, "Fehlerfall: Über den Feldern erscheint ein Meldungsband mit der Servermeldung.")
    w.note(24, 580, "Die Schaltfläche bleibt gesperrt, solange ein Feld leer ist — abgeleitet aus dem React-State.")
    w.note(24, 600, "Keine Navigation sichtbar: Vor der Anmeldung gibt es nichts zu navigieren.")
    return w


def seite_uebersicht():
    w = Wire("Entwurf 2 — Übersicht  (/)", "Einstieg nach der Anmeldung")
    chrome(w, "Übersicht")
    x0 = 210
    w.text(x0, 140, "Willkommen, <Name>", size=16, weight="700")
    w.note(x0, 160, "Übersicht über die berechtigten Projekte (US-8)")
    for i, label in enumerate(["Aktive\nProjekte", "Archivierte", "Offene\nAufgaben", "Erledigte"]):
        w.box(x0 + i * 190, 178, 175, 72)
        w.text(x0 + 14 + i * 190, 210, "12", size=20, weight="700")
        w.text(x0 + 14 + i * 190, 232, label.replace("\n", " "), size=11, fill=GREY_DARK)
    w.text(x0, 288, "Aktive Projekte", size=14, weight="600")
    for i in range(3):
        w.box(x0 + i * 250, 302, 235, 130)
        w.text(x0 + 14 + i * 250, 328, "Projektname", size=12, weight="600")
        w.note(x0 + 14 + i * 250, 348, "n Mitarbeitende")
        w.text(x0 + 14 + i * 250, 380, "Fortschritt", size=11, fill=GREY_DARK)
        w.box(x0 + 14 + i * 250, 388, 205, 8, fill="#FFFFFF")
        w.box(x0 + 14 + i * 250, 388, 90, 8, fill=GREY_DARK)
        w.note(x0 + 14 + i * 250, 412, "3 von 7 Aufgaben erledigt")
    w.note(24, 560, "Kacheln sind anklickbar und führen direkt ins Projektdetail.")
    w.note(24, 580, "Kennzahlen werden im Frontend aus der Projektliste berechnet — kein eigener Endpunkt nötig.")
    return w


def seite_projektliste():
    w = Wire("Entwurf 3 — Projektliste  (/projects)", "US-2, US-6, US-8")
    chrome(w, "Projekte")
    x0 = 210
    w.text(x0, 142, "Projekte", size=16, weight="700")
    w.button(W - 200, 126, 150, "Projekt anlegen", h=30)
    w.note(W - 200, 172, "(nur ADMIN / Projektleitung)")
    for i, f in enumerate(["Aktiv", "Archiviert", "Alle"]):
        w.box(x0 + i * 92, 180, 90, 30, fill=GREY_FILL if i == 0 else "#FFFFFF")
        w.text(x0 + 45 + i * 92, 200, f, size=12, anchor="middle")
    for row in range(2):
        for col in range(3):
            x, y = x0 + col * 250, 230 + row * 150
            w.box(x, y, 235, 138)
            w.text(x + 14, y + 26, "Projektname", size=12, weight="600")
            if row == 1 and col == 2:
                w.box(x + 150, y + 12, 72, 20, fill="#FFFFFF")
                w.text(x + 186, y + 26, "Archiviert", size=10, anchor="middle", fill=GREY_DARK)
            w.note(x + 14, y + 48, "Kurzbeschreibung des Projekts")
            w.note(x + 14, y + 74, "n Mitarbeitende")
            w.box(x + 14, y + 96, 205, 8, fill="#FFFFFF")
            w.box(x + 14, y + 96, 120, 8, fill=GREY_DARK)
            w.note(x + 14, y + 122, "x von y Aufgaben erledigt")
    w.note(24, 590, "Mitarbeitende sehen hier ausschließlich die ihnen zugeordneten Projekte (US-8).")
    w.note(24, 610, "Der Filter setzt den Abfrageparameter ?status= — der Server filtert, nicht der Client.")
    return w


def seite_projektdetail():
    w = Wire("Entwurf 4 — Projektdetail  (/projects/:id)", "US-3, US-4, US-5, US-6")
    chrome(w, "Projekte")
    x0 = 210
    w.note(x0, 132, "← Zurück zur Projektliste")
    w.text(x0, 162, "Projektname", size=16, weight="700")
    w.note(x0, 182, "Beschreibung des Projekts")
    for i, b in enumerate(["Mitarbeitende", "Archivieren"]):
        w.button(W - 380 + i * 120, 140, 110, b, h=28, primary=False)
    w.button(W - 140, 140, 110, "Aufgabe anlegen", h=28)
    w.box(x0, 200, 510, 66)
    w.text(x0 + 14, 224, "Fortschritt", size=11, fill=GREY_DARK)
    w.text(x0 + 460, 224, "43 %", size=12, weight="700")
    w.box(x0 + 14, 234, 480, 10, fill="#FFFFFF")
    w.box(x0 + 14, 234, 205, 10, fill=GREY_DARK)
    w.note(x0 + 14, 258, "3 von 7 Aufgaben erledigt")
    w.box(x0 + 522, 200, 246, 66)
    w.note(x0 + 536, 222, "Zugeordnete Mitarbeitende (3)")
    for i in range(3):
        w.box(x0 + 536 + i * 72, 234, 66, 22, fill="#FFFFFF")
    w.text(x0, 296, "Aufgaben", size=14, weight="600")
    for i, col in enumerate(["Offen", "In Bearbeitung", "Erledigt"]):
        x = x0 + i * 262
        w.box(x, 310, 248, 210, fill="#F7F8FA")
        w.text(x + 14, 334, col, size=12, weight="600")
        w.box(x + 210, 320, 26, 20, fill="#FFFFFF")
        for k in range(2):
            y = 348 + k * 82
            w.box(x + 12, y, 224, 72, fill="#FFFFFF")
            w.text(x + 24, y + 22, "Aufgabentitel", size=11, weight="600")
            w.note(x + 24, y + 38, "Zuständig · fällig TT.MM.JJJJ")
            w.box(x + 24, y + 46, 150, 20, fill="#F7F8FA")
            w.text(x + 32, y + 60, "Status ▾", size=10, fill=GREY_DARK)
            w.text(x + 218, y + 22, "🗑", size=11, fill=GREY_DARK)
    w.note(24, 560, "Statuswechsel über ein Auswahlfeld auf der Karte, bewusst ohne Drag & Drop:")
    w.note(24, 578, "Drag & Drop wäre per Tastatur kaum bedienbar. Nach dem Wechsel wird der Fortschritt neu geladen.")
    w.note(24, 596, "Ist das Projekt archiviert, sind alle Bedienelemente gesperrt und ein Hinweisband erscheint.")
    return w


def seite_benutzerverwaltung():
    w = Wire("Entwurf 5 — Benutzerverwaltung  (/admin/users)", "US-1, nur Rolle ADMIN")
    chrome(w, "Benutzerverwaltung")
    x0 = 210
    w.text(x0, 142, "Benutzerverwaltung", size=16, weight="700")
    w.note(x0, 162, "Konten anlegen und Rollen vergeben")
    w.button(W - 200, 126, 150, "Benutzer anlegen", h=30)
    w.box(x0, 186, W - 258, 300, fill="#FFFFFF")
    heads = ["Name", "E-Mail", "Rolle", "Status", "Aktion"]
    xs = [x0 + 16, x0 + 190, x0 + 400, x0 + 570, x0 + 690]
    w.box(x0, 186, W - 258, 36, fill=GREY_FILL)
    for h, x in zip(heads, xs):
        w.text(x, 209, h, size=11, weight="600")
    for r in range(5):
        y = 222 + r * 52
        w.line(x0, y, x0 + W - 258, y)
        w.text(xs[0], y + 32, "Vorname Nachname", size=11)
        w.text(xs[1], y + 32, "name@firma.de", size=11, fill=GREY_DARK)
        w.box(xs[2], y + 14, 150, 28, fill="#F7F8FA")
        w.text(xs[2] + 10, y + 33, "Rolle ▾", size=11, fill=GREY_DARK)
        w.box(xs[3], y + 16, 70, 22, fill="#FFFFFF")
        w.text(xs[3] + 35, y + 31, "Aktiv", size=10, anchor="middle", fill=GREY_DARK)
        w.text(xs[4] + 20, y + 33, "🗑", size=12, fill=GREY_DARK)
    w.note(24, 530, "Die Rolle wird direkt in der Tabellenzeile geändert — kein zusätzlicher Dialog.")
    w.note(24, 550, "Das eigene Konto lässt sich nicht löschen (Schaltfläche gesperrt).")
    w.note(24, 570, "Der Server verhindert zusätzlich, dass die letzte Administration ihre Rolle abgibt.")
    w.note(24, 596, "Für andere Rollen ist diese Seite weder sichtbar noch per Direktaufruf erreichbar (403).")
    return w


def seite_nichtgefunden():
    w = Wire("Entwurf 6 — Nicht gefunden  (/404)", "Auffangseite für unbekannte Adressen")
    chrome(w, "")
    w.text(600, 280, "Seite nicht gefunden", size=18, weight="700", anchor="middle")
    w.note(600, 310, "Die aufgerufene Adresse existiert nicht oder ist nicht freigegeben.")
    w.parts[-1] = w.parts[-1].replace('text-anchor="start"', 'text-anchor="middle"')
    w.button(530, 336, 140, "Zur Übersicht")
    w.note(24, 560, "Navigation bleibt erhalten, damit der Weg zurück immer offensteht.")
    w.note(24, 580, "Dieselbe Seite erscheint auch, wenn ein Projekt zwar existiert, aber nicht freigegeben ist —")
    w.note(24, 600, "die Oberfläche unterscheidet beides nicht, um keine Rückschlüsse auf fremde Daten zu erlauben.")
    return w


SEITEN = {
    "01-anmeldung": seite_anmeldung,
    "02-uebersicht": seite_uebersicht,
    "03-projektliste": seite_projektliste,
    "04-projektdetail": seite_projektdetail,
    "05-benutzerverwaltung": seite_benutzerverwaltung,
    "06-nicht-gefunden": seite_nichtgefunden,
}

if __name__ == "__main__":
    import pathlib
    out = pathlib.Path(__file__).parent
    for name, fn in SEITEN.items():
        (out / f"{name}.svg").write_text(fn().render(), encoding="utf-8")
        print(f"  ✓ {name}.svg")
    print(f"\n{len(SEITEN)} Wireframes in docs/wireframes/")
