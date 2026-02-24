# SEPOffice – Benutzerhandbuch

**Version 1.0.1 · Simon Erich Plath · © 2026 SEP Interactive**

---

## Inhaltsverzeichnis

1. [Übersicht](#1-übersicht)
2. [Installation & Start](#2-installation--start)
3. [Dashboard](#3-dashboard)
4. [SEPWrite – Textverarbeitung](#4-sepwrite--textverarbeitung)
5. [SEPGrid – Tabellenkalkulation](#5-sepgrid--tabellenkalkulation)
6. [SEPShow – Präsentationen](#6-sepshow--präsentationen)
7. [Eliot – KI-Assistent](#7-eliot--ki-assistent)
8. [Einstellungen](#8-einstellungen)
9. [Tastaturkürzel](#9-tastaturkürzel)

---

## 1. Übersicht

SEPOffice ist eine KI-gestützte Desktop-Office-Suite für Windows, bestehend aus drei integrierten Anwendungen:

| App | Funktion |
|-----|----------|
| **SEPWrite** | Rich-Text-Dokumente erstellen, Word/PDF-Export |
| **SEPGrid** | Tabellenkalkulation mit Formeln und Charts |
| **SEPShow** | Präsentationen mit Canvas-Editor |

Alle drei Apps sind mit **Eliot** verbunden – einem eingebetteten KI-Assistenten, der Texte formuliert, Formeln generiert und Folien gestaltet.

---

## 2. Installation & Start

### Installer
Führe `SEPOffice Setup 1.0.1.exe` aus. Der Assistent führt durch die Installation:
- Installationsverzeichnis wählbar (Standard: `Programme\SEPOffice`)
- Startmenü-Eintrag wird erstellt
- Optionaler Desktop-Shortcut

### Direkt starten (ohne Installer)
`release\win-unpacked\SEPOffice.exe` ausführen.

### Erster Start
Beim ersten Start lädt der KI-Service im Hintergrund das Sprachmodell (Qwen2.5-0.5B). Der Ladefortschritt ist im Eliot-Chat-Widget unten rechts sichtbar. Je nach Hardware dauert das **1–5 Minuten**.

> **Hinweis:** Die App ist sofort nutzbar – Eliot wird aktiv, sobald der Ladebalken 100% erreicht.

---

## 3. Dashboard

![Dashboard](assets/screenshots/01_dashboard.png)

Das Dashboard ist die Startseite von SEPOffice. Es zeigt:

### Drei App-Kacheln
- **SEPWrite** – Dokument erstellen oder öffnen
- **SEPGrid** – Tabelle erstellen oder öffnen  
- **SEPShow** – Präsentation erstellen oder öffnen *(NEU)*

Klick auf eine Kachel → Neues leeres Dokument in der jeweiligen App.

### Zuletzt geöffnete Dokumente
Unterhalb der Kacheln erscheinen die zuletzt bearbeiteten Dokumente mit Typ-Icon, Name und letztem Änderungsdatum. Klick auf einen Eintrag öffnet das Dokument direkt.

### Navigation
Die obere Navigationsleiste ist in allen Apps verfügbar:

| Element | Funktion |
|---------|----------|
| **SEPWrite / SEPGrid / SEPShow** (Buttons) | Zwischen Apps wechseln |
| ⚙️ | Einstellungen öffnen |
| ⌨️ | Tastaturkürzel anzeigen |
| 🌙 / ☀️ | Dark/Light-Mode umschalten |

---

## 4. SEPWrite – Textverarbeitung

![SEPWrite Editor](assets/screenshots/02_sepwrite.png)

SEPWrite ist ein moderner Rich-Text-Editor auf Basis von **TipTap**.

### 4.1 Formatierung

Die Symbolleiste bietet folgende Formatierungsoptionen:

| Symbol | Funktion | Tastenkürzel |
|--------|----------|--------------|
| **B** | Fettschrift | `Strg + B` |
| *I* | Kursivschrift | `Strg + I` |
| <u>U</u> | Unterstrichen | `Strg + U` |
| H1 | Überschrift 1 | — |
| H2 | Überschrift 2 | — |
| Liste | Aufzählungsliste | — |
| 1. Liste | Nummerierte Liste | — |

### 4.2 Bilder einfügen

Über **Einfügen → Bild** öffnet sich das Bild-Einfügen-Dialogfeld:
- Bild per Drag & Drop oder Dateiauswahl hochladen
- Ausrichtung: Links, Zentriert, Rechts
- Bilder werden direkt im Dokument eingebettet

### 4.3 Dokument speichern & exportieren

| Aktion | Beschreibung |
|--------|-------------|
| **Speichern** | Automatisches Speichern im lokalen Browser-Speicher |
| **Als .docx exportieren** | Word-kompatibles Dokument herunterladen |
| **Drucken / PDF** | Druckvorschau mit Seiteneinrichtung, dann drucken oder als PDF speichern |

### 4.4 KI-Unterstützung

Der Eliot-Chat (→ [Kapitel 7](#7-eliot--ki-assistent)) ist in SEPWrite vollständig integriert. Textentwürfe, Überarbeitungen und Umformulierungen können direkt im Chat angefordert werden.

---

## 5. SEPGrid – Tabellenkalkulation

![SEPGrid](assets/screenshots/03_sepgrid.png)

SEPGrid ist eine leistungsfähige Tabellenkalkulation mit **10.000 Zeilen × 26 Spalten** pro Tabellenblatt – vergleichbar mit Microsoft Excel und OpenOffice Calc.

### 5.1 Grundlegende Bedienung

| Aktion | Beschreibung |
|--------|-------------|
| Zelle anklicken | Zelle auswählen |
| Doppelklick / F2 | Zelle bearbeiten |
| `Enter` | Bestätigen, zur nächsten Zeile |
| `Tab` | Bestätigen, zur nächsten Spalte |
| `Escape` | Bearbeitung abbrechen |
| `Strg + Z` | Rückgängig |
| `Strg + Y` | Wiederholen |
| `Strg + C` | Kopieren |
| `Strg + V` | Einfügen |
| `Strg + X` | Ausschneiden |
| `Strg + B` | Fettschrift |
| `Strg + I` | Kursiv |
| `Strg + U` | Unterstrichen |
| `Strg + F` | Suchen & Ersetzen |
| `Entf` | Zelleninhalt löschen |

**Mehrfachauswahl:** Maus mit gedrückter linker Taste ziehen oder `Shift + Klick`.

**Ausfüllkästchen:** Das blaue Quadrat unten rechts an einer Zelle ziehen, um Werte oder Formeln zu kopieren.

### 5.2 Die Formelleiste

Die Formelleiste befindet sich unterhalb der Ribbon-Symbolleiste:

```
┌─────────┬────┬───────────────────────────────────────────┐
│   A1    │ fx │  =SUM(A1:A10)                             │
└─────────┴────┴───────────────────────────────────────────┘
  ↑          ↑              ↑
  Zelladresse  Formel-Symbol  Eingabefeld (zeigt Rohformel)
```

- **Zelladresse**: Zeigt die aktive Zelle oder den markierten Bereich (z.B. `A1:B5`)
- **fx-Symbol**: Kennzeichnet die Formeleingabe
- **Eingabefeld**: Zeigt immer die Rohformel (z.B. `=SUM(A1:A10)`) – nicht das Ergebnis

**Fehleranzeige:** Bei Formelfehlern wie `#ERROR`, `#REF!`, `#DIV/0!` etc. wird das Eingabefeld rot umrandet und der Fehlertyp rechts angezeigt.

### 5.3 Formeln eingeben

Formeleingabe beginnt immer mit `=`:

```
=SUM(A1:A10)           Summe
=AVERAGE(B1:B5)        Mittelwert
=MAX(C1:C100)          Maximum
=MIN(D1:D50)           Minimum
=COUNT(A:A)            Anzahl
=IF(A1>0,"Ja","Nein")  Bedingung
=VLOOKUP(...)          Verweis
=ROUND(A1, 2)          Runden
```

#### Formel-Referenzen per Mausklick

Statt Zelladressen manuell einzutippen:

1. Tippe `=` oder eine Funktion wie `=SUM(`
2. Klicke auf die gewünschte Zelle → Adresse wird eingefügt
3. Ziehe für Bereiche → Bereich wird eingefügt (z.B. `A1:B10`)

Dies funktioniert nach `=`, `(`, `+`, `-`, `*`, `/`, `,` und `!`.

#### Formel-Schnellzugriff

Klick auf das **Taschenrechner-Symbol (fx)** öffnet Formel-Vorschläge:
- SUM(), AVERAGE(), MAX(), MIN(), COUNT(), IF()
- Bei markiertem Bereich wird dieser automatisch eingesetzt

### 5.4 Sheet-übergreifende Formeln

Referenzen auf andere Tabellenblätter – wie in Excel:

```
=Tabelle2!A1                    Einzelne Zelle aus Tabelle2
=SUM(Tabelle2!A1:B10)           Summe aus Tabelle2
=Tabelle1!A1 + Tabelle2!B5      Kombination mehrerer Blätter
=AVERAGE(Umsatz!C1:C100)        Bereich aus Sheet "Umsatz"
```

**Per Mausklick:**
1. Tippe `=` in eine Zelle
2. Klicke auf einen anderen Sheet-Tab → `Tabelle2!` wird eingefügt
3. Klicke auf die gewünschte Zelle → `A1` wird ergänzt

### 5.5 Zahlenformate

Über das **123-Symbol** in der Toolbar:

| Format | Beispiel | Beschreibung |
|--------|----------|--------------|
| Standard | 1234.5 | Keine Formatierung |
| Zahl | 1.234,56 | Deutsche Schreibweise mit 2 Dezimalen |
| Währung | 1.234,56 € | Euro-Format |
| Prozent | 12,5 % | Wert × 100 mit %-Zeichen |
| Tausender | 1.234 | Nur ganze Zahlen mit Tausendertrennzeichen |
| Datum | 24.02.2026 | Deutsches Datumsformat |

### 5.6 Zellen zusammenführen (Merge)

Mehrere Zellen zu einer verbinden:

1. Zellbereich auswählen
2. **Einfügen → Zellen zusammenführen**
3. Nur der Wert der oberen linken Zelle bleibt erhalten

**Zusammenführung aufheben:** Gleiche Menüposition oder **Einfügen → Zusammenführung aufheben**

### 5.7 Bedingte Formatierung

Zellen automatisch formatieren basierend auf Werten:

1. Bereich auswählen
2. **Bearbeiten → Bedingte Formatierung...**
3. Regel wählen:
   - Größer als / Kleiner als
   - Gleich
   - Zwischen (zwei Werte)
   - Text enthält
4. Farben für Text und Hintergrund wählen
5. **Hinzufügen**

*Beispiel:* Alle Werte über 1000 grün hinterlegen.

**Entfernen:** Bereich auswählen → **Bearbeiten → Bedingte Formatierung entfernen**

### 5.8 Fenster fixieren (Freeze Panes)

Zeilen- oder Spaltenüberschriften beim Scrollen sichtbar halten:

1. Zelle auswählen, ab der gescrollt werden soll
2. **Ansicht → Fenster fixieren**
3. Alle Zeilen oberhalb und Spalten links der Auswahl werden fixiert

**Aufheben:** **Ansicht → Fixierung aufheben**

### 5.9 Kommentare

Notizen zu Zellen hinzufügen:

1. Zelle auswählen
2. **Einfügen → Kommentar hinzufügen**
3. Text eingeben → OK

Zellen mit Kommentaren zeigen ein **rotes Dreieck** in der oberen rechten Ecke. Tooltip erscheint bei Hover.

### 5.10 Suchen & Ersetzen

`Strg + F` oder **Bearbeiten → Suchen & Ersetzen**:

- **Suchen**: Text eingeben, mit ◀ ▶ durch Treffer navigieren
- **Ersetzen**: Einzeln oder alle auf einmal ersetzen

### 5.11 Zeilen und Spalten einfügen/löschen

**Über das Einfügen-Menü:**
- Zeile oberhalb/unterhalb einfügen
- Spalte links/rechts einfügen
- Zeile/Spalte löschen

Die Position richtet sich nach der aktuellen Auswahl.

### 5.12 Statusleiste

Am unteren Rand werden bei Mehrfachauswahl automatisch Statistiken angezeigt:

```
Σ Summe: 12.345   ⌀ Durchschnitt: 1.234   ↓ Min: 100   ↑ Max: 5.000   Anzahl: 10
```

### 5.13 Import / Export

| Funktion | Format | Beschreibung |
|----------|--------|--------------|
| Importieren | `.xlsx`, `.xlsm` | Excel-Dateien öffnen |
| CSV-Import | `.csv` | Komma-/Semikolon-getrennte Dateien |
| Exportieren | `.xlsx` | Als Excel-Datei speichern |
| CSV-Export | `.csv` | Als CSV-Datei speichern (UTF-8, Semikolon) |
| Drucken / PDF | — | Druckvorschau, nur befüllte Zeilen |
| Bild einfügen | PNG, JPG | Bild in Tabellenbereich einbetten |

### 5.14 KI-Funktionen

#### KI-Formelgenerator
Klick auf **✨** bei der Formelleiste:
> „Berechne den Durchschnitt aller positiven Werte in Spalte B"  
> → `=AVERAGEIF(B:B,">0")`

#### KI-Tabellenassistent
Glassmorphism-Overlay bei Klick auf den KI-Button:
> „Erstelle eine Monatsumsatz-Tabelle für 2025 mit Spalten: Monat, Umsatz, Kosten, Gewinn"

#### Vibe Writing
Aktivierbar über **Datei → Vibe Writing aktivieren**: KI-Unterstützung beim Tippen.

### 5.15 Tastaturkürzel-Übersicht

| Kürzel | Funktion |
|--------|----------|
| `Strg + Z` | Rückgängig |
| `Strg + Y` | Wiederholen |
| `Strg + C` | Kopieren |
| `Strg + V` | Einfügen |
| `Strg + X` | Ausschneiden |
| `Strg + B` | Fettschrift |
| `Strg + I` | Kursiv |
| `Strg + U` | Unterstrichen |
| `Strg + F` | Suchen & Ersetzen |
| `F2` | Zelle bearbeiten |
| `Enter` | Bestätigen + Zeile runter |
| `Tab` | Bestätigen + Spalte rechts |
| `Escape` | Abbrechen |
| `Entf` | Inhalt löschen |
| `Shift + Klick` | Bereich erweitern |

---

## 6. SEPShow – Präsentationen

![SEPShow](assets/screenshots/04_sepshow.png)

SEPShow ist ein folienbasierter Präsentationseditor auf Basis von **Konva** (Canvas-Renderer).

### 6.1 Oberfläche

| Bereich | Beschreibung |
|---------|-------------|
| **Linke Sidebar** | Folienliste – Vorschau aller Folien, Reihenfolge per Drag & Drop |
| **Hauptbereich** | Canvas-Editor der aktiven Folie |
| **Toolbar (oben)** | Werkzeuge, Export, Präsentationsmodus |
| **Speaker Notes (unten)** | Notizen zur aktuellen Folie |

### 6.2 Elemente einfügen

Über die Toolbar:

| Aktion | Beschreibung |
|--------|-------------|
| **Text** | Textfeld auf der Folie platzieren |
| **Bild** | Bild per Upload oder Clipboard einfügen |
| **Form** | Rechtecke, Kreise etc. |
| **AI-Layout** | KI generiert ein vollständiges Folienlayout |

Alle Elemente können:
- Per Maus frei verschoben werden
- In Größe verändert werden (Eckanfasser)
- Rotiert werden

### 6.3 Folienverwaltung

| Aktion | Beschreibung |
|--------|-------------|
| **+** in der Sidebar | Neue Folie hinzufügen |
| Rechtsklick auf Folie | Duplizieren, Löschen, Verschieben |
| Drag & Drop in Sidebar | Reihenfolge ändern |

### 6.4 Präsentationsmodus

Klick auf **Präsentieren** (Bildschirm-Icon) öffnet die Vollbild-Präsentation:
- Navigation: `→` / `←` Pfeiltasten oder Klick
- `Esc` beendet den Präsentationsmodus

### 6.5 Speaker Notes

Unterhalb des Canvas gibt es ein Notizfeld für jede Folie. Die Notizen sind nur im Editor sichtbar, nicht bei der Präsentation.

### 6.6 Export

| Format | Beschreibung |
|--------|-------------|
| Speichern | Im lokalen Speicher (automatisch) |
| PDF/Druck | Folien als PDF exportieren |

---

## 7. Eliot – KI-Assistent

![Eliot Chat](assets/screenshots/05_eliot.png)

Eliot ist der eingebettete KI-Assistent, der in allen drei Apps verfügbar ist.

### 7.1 Das Chat-Widget

Das **schwebende Eliot-Symbol** befindet sich unten rechts in allen Apps. Klick darauf öffnet das Chat-Fenster.

#### Status-Anzeigen

| Symbol | Status |
|--------|--------|
| 💬 (normal) | KI bereit – tippe eine Anfrage |
| ⏳ (drehend) | KI lädt – Modell wird initialisiert |
| ❌ (rot) | Fehler oder nicht verbunden |

#### Ladefortschritt
Beim ersten Start erscheint ein **Ladebalken** (0–100%), während das Sprachmodell in den Arbeitsspeicher geladen wird.

### 7.2 Mit Eliot arbeiten

Tippe eine Anfrage in das Chat-Eingabefeld und bestätige mit `Enter` oder dem Senden-Button.

**Beispielanfragen:**

*In SEPWrite:*
- „Schreibe eine professionelle Einleitung für einen Bericht über erneuerbare Energien"
- „Überarbeite diesen Text formeller"
- „Fasse den folgenden Text in 3 Sätzen zusammen"

*In SEPGrid:*
- „Welche Formel berechnet den gleitenden Durchschnitt über 5 Werte?"
- „Erstelle eine Formel, die den höchsten Wert in Spalte C findet"

*In SEPShow:*
- „Erstelle eine Folie über Klimawandel mit 3 Aufzählungspunkten"
- „Schlage ein Farbschema für eine Geschäftspräsentation vor"

### 7.3 Ghost Text (Auto-Vervollständigung)

In SEPWrite bietet Eliot **Ghost Text** – eine blassgraue Textvorschau, während du tippst. `Tab` übernimmt den Vorschlag.

### 7.4 KI-Service starten (manuell)

Falls der KI-Service nicht automatisch startet, erscheint ein **„AI Service starten"**-Button im Eliot-Widget. Klick startet den Dienst manuell.

---

## 8. Einstellungen

Das Einstellungs-Fenster (⚙️ in der Navigationsleiste) enthält:

### KI-Einstellungen
| Option | Beschreibung |
|--------|-------------|
| **API-URL** | URL des KI-Backends (Standard: `http://localhost:8080`) |
| **API-Key** | Optional, für externe KI-APIs |
| **Verbindung testen** | Prüft ob der KI-Service erreichbar ist |

### Sprache
SEPOffice unterstützt **29 Sprachen**. Die Sprache kann im Einstellungs-Dialog gewählt werden und gilt für die gesamte Benutzeroberfläche.

---

## 9. Tastaturkürzel

Das Hilfe-Fenster (⌨️ in der Navigationsleiste) zeigt alle Tastaturkürzel.

### Global

| Kürzel | Funktion |
|--------|----------|
| `Strg + Z` | Rückgängig |
| `Strg + Y` | Wiederholen |
| `Strg + S` | Speichern |

### SEPWrite

| Kürzel | Funktion |
|--------|----------|
| `Strg + B` | Fettschrift |
| `Strg + I` | Kursiv |
| `Strg + U` | Unterstrichen |
| `Strg + P` | Drucken |

### SEPGrid

| Kürzel | Funktion |
|--------|----------|
| `Enter` | Zelle bestätigen, nach unten |
| `Tab` | Zelle bestätigen, nach rechts |
| `Escape` | Bearbeitung abbrechen |
| `Strg + C` | Kopieren |
| `Strg + V` | Einfügen |
| `F2` | Zelle bearbeiten |
| Pfeiltasten | Zelle navigieren |
| `Shift + Pfeiltasten` | Mehrfachauswahl |

### SEPShow

| Kürzel | Funktion |
|--------|----------|
| `→` / `←` | Nächste / Vorherige Folie (Präsentationsmodus) |
| `Esc` | Präsentationsmodus beenden |
| `Strg + D` | Folie duplizieren |
| `Entf` | Ausgewähltes Element löschen |

---

## Technische Hinweise

- **Datenspeicherung:** Alle Dokumente werden lokal im Browser-Speicher (`localStorage`) gesichert. Keine Daten werden an externe Server übertragen.
- **KI-Modell:** Qwen2.5-0.5B läuft vollständig lokal – keine Internetverbindung für KI-Funktionen erforderlich.
- **Systemanforderungen:** Windows 10/11, min. 4 GB RAM (8 GB empfohlen für das KI-Modell)
- **Deinstallation:** Über Windows „Apps & Features" → SEPOffice deinstallieren

---

*SEPOffice v1.0.1 · Simon Erich Plath · SEP Interactive · 2026*
