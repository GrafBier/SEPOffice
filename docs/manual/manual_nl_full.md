# SEPOffice – Gebruikershandleiding

**Versie 1.0.1 · Simon Erich Plath · © 2026 SEP Interactive**

---

## Inhoudsopgave

1. [Overzicht](#1-overzicht)
2. [Installatie en Opstarten](#2-installatie-en-opstarten)
3. [Dashboard](#3-dashboard)
4. [SEPWrite – Tekstverwerking](#4-sepwrite--tekstverwerking)
5. [SEPGrid – Spreadsheet](#5-sepgrid--spreadsheet)
6. [SEPShow – Presentaties](#6-sepshow--presentaties)
7. [Eliot – AI-assistent](#7-eliot--ai-assistent)
8. [Instellingen](#8-instellingen)
9. [Sneltoetsen](#9-sneltoetsen)

---

## 1. Overzicht

SEPOffice is een AI-ondersteund desktop-kantoorpakket voor Windows, bestaande uit drie geïntegreerde toepassingen:

| App | Functie |
|-----|---------|
| **SEPWrite** | Rich-text documenten maken, exporteren naar Word/PDF |
| **SEPGrid** | Spreadsheet met formules en grafieken |
| **SEPShow** | Presentaties met canvas-editor |

Alle drie apps zijn verbonden met **Eliot** – een ingebouwde AI-assistent die teksten formuleert, formules genereert en dia's ontwerpt.

---

## 2. Installatie en Opstarten

### Installatieprogramma
Voer `SEPOffice Setup 1.0.1.exe` uit. De wizard begeleidt u door de installatie:
- Selecteerbare installatiemap (standaard: `Programmabestanden\SEPOffice`)
- Startmenu-item wordt aangemaakt
- Optionele snelkoppeling op het bureaublad

### Direct Starten (zonder installatie)
Voer `release\win-unpacked\SEPOffice.exe` uit.

### Eerste Start
Bij de eerste start laadt de AI-service het taalmodel (Qwen2.5-0.5B) op de achtergrond. De voortgang is zichtbaar in het Eliot-chat-widget rechtsonder. Afhankelijk van de hardware duurt dit **1–5 minuten**.

> **Opmerking:** De app is direct bruikbaar – Eliot wordt actief zodra de laadbalk 100% bereikt.

---

## 3. Dashboard

Het Dashboard is de startpagina van SEPOffice.

### Drie App-tegels
- **SEPWrite** – Document aanmaken of openen
- **SEPGrid** – Spreadsheet aanmaken of openen
- **SEPShow** – Presentatie aanmaken of openen

### Recente Documenten
Onder de tegels verschijnen recent bewerkte documenten met type-icoon, naam en datum van laatste wijziging.

### Navigatie

| Element | Functie |
|---------|---------|
| **SEPWrite / SEPGrid / SEPShow** | Wisselen tussen apps |
| ⚙️ | Instellingen openen |
| ⌨️ | Sneltoetsen tonen |
| 🌙 / ☀️ | Donkere/lichte modus wisselen |

---

## 4. SEPWrite – Tekstverwerking

SEPWrite is een moderne rich-text editor op basis van **TipTap**.

### 4.1 Opmaak

| Symbool | Functie | Sneltoets |
|---------|---------|-----------|
| **V** | Vet | `Ctrl + B` |
| *C* | Cursief | `Ctrl + I` |
| <u>O</u> | Onderstrepen | `Ctrl + U` |
| K1 | Kop 1 | — |
| K2 | Kop 2 | — |

### 4.2 Afbeeldingen invoegen
Via **Invoegen → Afbeelding**: uploaden via slepen of bestandsselectie.

### 4.3 Opslaan en Exporteren

| Actie | Beschrijving |
|-------|-------------|
| **Opslaan** | Automatisch opslaan in lokale browseropslag |
| **Exporteren als .docx** | Word-compatibel document downloaden |
| **Afdrukken / PDF** | Afdrukvoorbeeld, dan afdrukken of opslaan als PDF |

---

## 5. SEPGrid – Spreadsheet

SEPGrid is een krachtige spreadsheet met **10.000 rijen × 26 kolommen** per werkblad – vergelijkbaar met Microsoft Excel en OpenOffice Calc.

### 5.1 Basisbediening

| Actie | Beschrijving |
|-------|-------------|
| Cel aanklikken | Cel selecteren |
| Dubbelklikken / F2 | Cel bewerken |
| `Enter` | Bevestigen, naar volgende rij |
| `Tab` | Bevestigen, naar volgende kolom |
| `Escape` | Bewerking annuleren |
| `Ctrl + Z` | Ongedaan maken |
| `Ctrl + Y` | Opnieuw uitvoeren |
| `Ctrl + C` | Kopiëren |
| `Ctrl + V` | Plakken |
| `Ctrl + X` | Knippen |
| `Ctrl + B` | Vet |
| `Ctrl + I` | Cursief |
| `Ctrl + U` | Onderstrepen |
| `Ctrl + F` | Zoeken en Vervangen |
| `Del` | Celinhoud wissen |

**Meervoudige selectie:** Sleep de muis met de linkerknop ingedrukt of `Shift + Klik`.

**Vulgreep:** Sleep het blauwe vierkantje rechtsonder van een cel om waarden of formules te kopiëren.

### 5.2 De Formulebalk

```
┌─────────┬────┬───────────────────────────────────────────┐
│   A1    │ fx │  =SOM(A1:A10)                             │
└─────────┴────┴───────────────────────────────────────────┘
  ↑          ↑              ↑
  Celadres   Symbool        Invoerveld (toont ruwe formule)
```

- **Celadres**: Toont de actieve cel of geselecteerd bereik (bijv. `A1:B5`)
- **Symbool fx**: Geeft invoer van formule aan
- **Invoerveld**: Toont altijd de ruwe formule – niet het resultaat

**Foutweergave:** Bij formulefouten zoals `#FOUT`, `#VERW!`, `#DEEL/0!` enz. wordt het veld rood omrand en de fout rechts weergegeven.

### 5.3 Formules Invoeren

Formule-invoer begint altijd met `=`:

```
=SOM(A1:A10)               Som
=GEMIDDELDE(B1:B5)         Gemiddelde
=MAX(C1:C100)              Maximum
=MIN(D1:D50)               Minimum
=AANTAL(A:A)               Aantal
=ALS(A1>0,"Ja","Nee")      Voorwaarde
=VERT.ZOEKEN(...)          Verticaal zoeken
=AFRONDEN(A1; 2)           Afronden
```

#### Formule-referenties via muisklik

1. Typ `=` of een functie zoals `=SOM(`
2. Klik op de gewenste cel → Adres wordt ingevoegd
3. Slepen voor bereiken → Bereik wordt ingevoegd (bijv. `A1:B10`)

### 5.4 Formules tussen Werkbladen

Verwijzingen naar andere werkbladen – net als in Excel:

```
=Blad2!A1                       Enkele cel uit Blad2
=SOM(Blad2!A1:B10)              Som uit Blad2
=Blad1!A1 + Blad2!B5            Combinatie van meerdere bladen
=GEMIDDELDE(Verkoop!C1:C100)    Bereik uit blad "Verkoop"
```

**Via muisklik:**
1. Typ `=` in een cel
2. Klik op een ander bladtabblad → `Blad2!` wordt ingevoegd
3. Klik op de gewenste cel → `A1` wordt toegevoegd

### 5.5 Getalnotaties

Via het **123-symbool** in de werkbalk:

| Indeling | Voorbeeld | Beschrijving |
|----------|---------|-------------|
| Standaard | 1234.5 | Geen opmaak |
| Getal | 1.234,56 | Notatie met 2 decimalen |
| Valuta | € 1.234,56 | Valuta-indeling |
| Percentage | 12,5% | Waarde × 100 met %-teken |
| Duizendtallen | 1.234 | Gehele getallen met duizendscheidingsteken |
| Datum | 24-02-2026 | Datumindeling |

### 5.6 Cellen samenvoegen

1. Selecteer celbereik
2. **Invoegen → Cellen samenvoegen**
3. Alleen de waarde van de cel linksboven blijft behouden

**Samenvoegen opheffen:** **Invoegen → Samenvoegen opheffen**

### 5.7 Voorwaardelijke opmaak

1. Bereik selecteren
2. **Bewerken → Voorwaardelijke opmaak...**
3. Regel kiezen: Groter dan / Kleiner dan / Gelijk aan / Tussen / Tekst bevat
4. Kleuren voor tekst en achtergrond kiezen
5. **Toevoegen**

**Verwijderen:** Bereik selecteren → **Bewerken → Voorwaardelijke opmaak verwijderen**

### 5.8 Deelvensters blokkeren

1. Selecteer de cel vanaf waar gescrold moet worden
2. **Beeld → Deelvensters blokkeren**
3. Alle rijen erboven en kolommen links worden geblokkeerd

**Blokkering opheffen:** **Beeld → Blokkering opheffen**

### 5.9 Opmerkingen

1. Cel selecteren → **Invoegen → Opmerking toevoegen** → Tekst invoeren → OK
2. Cellen met opmerkingen tonen een **rood driehoekje** rechtsboven

### 5.10 Zoeken en Vervangen

`Ctrl + F` of **Bewerken → Zoeken en Vervangen**:
- **Zoeken**: Navigeren met ◀ ▶
- **Vervangen**: Afzonderlijk of allemaal tegelijk

### 5.11 Rijen en Kolommen invoegen/verwijderen

Via het menu **Invoegen**: Rij invoegen boven/onder, kolom links/rechts, rij/kolom verwijderen.

### 5.12 Statusbalk

Onderin worden automatisch statistieken weergegeven voor meervoudige selecties:

```
Σ Som: 12.345   ⌀ Gemiddelde: 1.234   ↓ Min: 100   ↑ Max: 5.000   Aantal: 10
```

### 5.13 Importeren / Exporteren

| Functie | Indeling | Beschrijving |
|---------|---------|-------------|
| Importeren | `.xlsx`, `.xlsm` | Excel-bestanden openen |
| CSV importeren | `.csv` | Komma/puntkomma gescheiden bestanden |
| Exporteren | `.xlsx` | Opslaan als Excel-bestand |
| CSV exporteren | `.csv` | Opslaan als CSV (UTF-8, puntkomma) |
| Afdrukken / PDF | — | Afdrukvoorbeeld, alleen gevulde rijen |
| Afbeelding invoegen | PNG, JPG | Afbeelding insluiten in spreadsheet |

### 5.14 AI-functies

#### AI-formulegenerator
Klik op **✨** bij de formulebalk:
> "Bereken het gemiddelde van alle positieve waarden in kolom B"
> → `=GEMIDDELDE.ALS(B:B;">0")`

#### AI-tabelassistent
> "Maak een maandelijkse verkooptabel voor 2025 met kolommen: Maand, Omzet, Kosten, Winst"

### 5.15 Overzicht Sneltoetsen

| Sneltoets | Functie |
|-----------|---------|
| `Ctrl + Z` | Ongedaan maken |
| `Ctrl + Y` | Opnieuw uitvoeren |
| `Ctrl + C` | Kopiëren |
| `Ctrl + V` | Plakken |
| `Ctrl + X` | Knippen |
| `Ctrl + B` | Vet |
| `Ctrl + I` | Cursief |
| `Ctrl + U` | Onderstrepen |
| `Ctrl + F` | Zoeken en Vervangen |
| `F2` | Cel bewerken |
| `Enter` | Bevestigen + omlaag |
| `Tab` | Bevestigen + rechts |
| `Escape` | Annuleren |
| `Del` | Inhoud wissen |
| `Shift + Klik` | Selectie uitbreiden |

---

## 6. SEPShow – Presentaties

SEPShow is een op dia's gebaseerde presentatie-editor op basis van **Konva** (canvas-renderer).

### 6.1 Interface

| Gebied | Beschrijving |
|--------|-------------|
| **Linker zijbalk** | Diaslijst – voorvertoning, volgorde wijzigen via slepen |
| **Hoofdgebied** | Canvas-editor van de actieve dia |
| **Werkbalk** | Hulpmiddelen, exporteren, presentatiemodus |
| **Presentatornotities** | Notities voor de huidige dia |

### 6.2 Presentatiemodus

Klik op **Presenteren** voor presentatie op volledig scherm:
- Navigatie: pijltoetsen `→` / `←` of klikken
- `Esc` beëindigt presentatiemodus

---

## 7. Eliot – AI-assistent

Eliot is de ingebouwde AI-assistent beschikbaar in alle drie apps.

### 7.1 Het Chat-widget

Het **zwevende Eliot-symbool** bevindt zich rechtsonder in alle apps.

#### Statusindicatoren

| Symbool | Status |
|---------|--------|
| 💬 (normaal) | AI gereed |
| ⏳ (draaiend) | AI laden |
| ❌ (rood) | Fout of niet verbonden |

---

## 8. Instellingen

### AI-instellingen
| Optie | Beschrijving |
|-------|-------------|
| **API-URL** | URL van de AI-backend (standaard: `http://localhost:8080`) |
| **API-sleutel** | Optioneel, voor externe AI-API's |
| **Verbinding testen** | Controleert of de AI-service bereikbaar is |

### Taal
SEPOffice ondersteunt **29 talen**. De taal kan worden geselecteerd in het instellingendialoogvenster.

---

## 9. Sneltoetsen

### Globaal

| Sneltoets | Functie |
|-----------|---------|
| `Ctrl + Z` | Ongedaan maken |
| `Ctrl + Y` | Opnieuw uitvoeren |
| `Ctrl + S` | Opslaan |

### SEPGrid

| Sneltoets | Functie |
|-----------|---------|
| `Enter` | Cel bevestigen, omlaag |
| `Tab` | Cel bevestigen, rechts |
| `Escape` | Bewerking annuleren |
| `Ctrl + C` | Kopiëren |
| `Ctrl + V` | Plakken |
| `F2` | Cel bewerken |
| Pijltoetsen | Door cellen navigeren |

---

## Technische Opmerkingen

- **Gegevensopslag:** Alle documenten worden lokaal opgeslagen in de browseropslag. Er worden geen gegevens naar externe servers verzonden.
- **AI-model:** Qwen2.5-0.5B draait volledig lokaal – geen internetverbinding vereist voor AI-functies.
- **Systeemvereisten:** Windows 10/11, min. 4 GB RAM (8 GB aanbevolen voor het AI-model)

---

*SEPOffice v1.0.1 · Simon Erich Plath · SEP Interactive · 2026*
