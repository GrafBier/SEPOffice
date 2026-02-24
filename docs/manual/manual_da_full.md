# SEPOffice – Brugermanual

**Version 1.0.1 · Simon Erich Plath · © 2026 SEP Interactive**

---

## Indholdsfortegnelse

1. [Oversigt](#1-oversigt)
2. [Installation og Start](#2-installation-og-start)
3. [Kontrolpanel](#3-kontrolpanel)
4. [SEPWrite – Tekstbehandling](#4-sepwrite--tekstbehandling)
5. [SEPGrid – Regneark](#5-sepgrid--regneark)
6. [SEPShow – Præsentationer](#6-sepshow--præsentationer)
7. [Eliot – AI-assistent](#7-eliot--ai-assistent)
8. [Indstillinger](#8-indstillinger)
9. [Tastaturgenveje](#9-tastaturgenveje)

---

## 1. Oversigt

SEPOffice er en AI-understøttet desktop-kontorpakke til Windows bestående af tre integrerede applikationer:

| App | Funktion |
|-----|----------|
| **SEPWrite** | Opret rich-text dokumenter, eksporter til Word/PDF |
| **SEPGrid** | Regneark med formler og diagrammer |
| **SEPShow** | Præsentationer med canvas-editor |

Alle tre apps er forbundet med **Eliot** – en indbygget AI-assistent, der formulerer tekster, genererer formler og designer dias.

---

## 2. Installation og Start

### Installationsprogram
Kør `SEPOffice Setup 1.0.1.exe`. Guiden fører dig gennem installationen:
- Valgbar installationsmappe (standard: `Program Files\SEPOffice`)
- Opretter startmenu-element
- Valgfri genvej på skrivebordet

### Direkte Start (uden installation)
Kør `release\win-unpacked\SEPOffice.exe`.

### Første Start
Ved første start indlæser AI-tjenesten sprogmodellen (Qwen2.5-0.5B) i baggrunden. Fremgangen er synlig i Eliots chat-widget nederst til højre. Afhængigt af hardwaren tager dette **1–5 minutter**.

> **Bemærk:** Appen er straks brugbar – Eliot aktiveres, når statuslinjen når 100%.

---

## 3. Kontrolpanel

Kontrolpanelet er SEPOffice' startside.

### Tre App-fliser
- **SEPWrite** – Opret eller åbn dokument
- **SEPGrid** – Opret eller åbn regneark
- **SEPShow** – Opret eller åbn præsentation

### Seneste Dokumenter
Under fliserne vises senest redigerede dokumenter med type-ikon, navn og dato for seneste ændring.

### Navigation

| Element | Funktion |
|---------|----------|
| **SEPWrite / SEPGrid / SEPShow** | Skifte mellem apps |
| ⚙️ | Åbn indstillinger |
| ⌨️ | Vis tastaturgenveje |
| 🌙 / ☀️ | Skift mørk/lys tilstand |

---

## 4. SEPWrite – Tekstbehandling

SEPWrite er en moderne rich-text-editor bygget på **TipTap**.

### 4.1 Formatering

| Symbol | Funktion | Genvej |
|--------|----------|--------|
| **F** | Fed | `Ctrl + B` |
| *K* | Kursiv | `Ctrl + I` |
| <u>U</u> | Understreget | `Ctrl + U` |
| O1 | Overskrift 1 | — |
| O2 | Overskrift 2 | — |

### 4.2 Indsæt Billeder
Via **Indsæt → Billede**: upload via træk eller filvalg.

### 4.3 Gem og Eksporter

| Handling | Beskrivelse |
|----------|------------|
| **Gem** | Automatisk gem i lokal browserlager |
| **Eksporter som .docx** | Download Word-kompatibelt dokument |
| **Udskriv / PDF** | Udskriftsvisning, derefter udskriv eller gem som PDF |

---

## 5. SEPGrid – Regneark

SEPGrid er et kraftfuldt regneark med **10.000 rækker × 26 kolonner** pr. ark – lignende Microsoft Excel og OpenOffice Calc.

### 5.1 Grundlæggende Brug

| Handling | Beskrivelse |
|----------|------------|
| Klik på celle | Vælg celle |
| Dobbeltklik / F2 | Rediger celle |
| `Enter` | Bekræft, gå til næste række |
| `Tab` | Bekræft, gå til næste kolonne |
| `Escape` | Annuller redigering |
| `Ctrl + Z` | Fortryd |
| `Ctrl + Y` | Gentag |
| `Ctrl + C` | Kopiér |
| `Ctrl + V` | Sæt ind |
| `Ctrl + X` | Klip |
| `Ctrl + B` | Fed |
| `Ctrl + I` | Kursiv |
| `Ctrl + U` | Understreget |
| `Ctrl + F` | Find og Erstat |
| `Del` | Ryd celleindhold |

**Flervælg:** Træk musen eller `Shift + Klik`.

**Udfyldningshåndtag:** Træk den blå firkant i cellens nederste højre hjørne for at kopiere værdier eller formler.

### 5.2 Formellinjen

```
┌─────────┬────┬───────────────────────────────────────────┐
│   A1    │ fx │  =SUM(A1:A10)                             │
└─────────┴────┴───────────────────────────────────────────┘
  ↑          ↑              ↑
  Celleadr.   Symbol          Indtastningsfelt (viser råformlen)
```

- **Celleadresse**: Viser aktiv celle eller valgt område (f.eks. `A1:B5`)
- **Symbol fx**: Angiver formelindtastning
- **Indtastningsfelt**: Viser altid råformlen – ikke resultatet

**Fejlvisning:** Ved formelfejl som `#FEJL`, `#REF!`, `#DEL/0!` o.lign. markeres feltet med rød ramme og fejlen vises til højre.

### 5.3 Indtaste Formler

Formelindtastning starter altid med `=`:

```
=SUM(A1:A10)               Sum
=MIDDEL(B1:B5)             Gennemsnit
=MAKS(C1:C100)             Maksimum
=MIN(D1:D50)               Minimum
=ANTAL(A:A)                Tæl
=HVIS(A1>0;"Ja";"Nej")     Betingelse
=LOPSLAG(...)              Lodret opslag
=AFRUND(A1; 2)             Afrunding
```

#### Formelreferencer via Museklik

1. Skriv `=` eller en funktion som `=SUM(`
2. Klik på den ønskede celle → Adressen indsættes
3. Træk for områder → Området indsættes (f.eks. `A1:B10`)

### 5.4 Formler Mellem Ark

Referencer til andre ark – ligesom i Excel:

```
=Ark2!A1                      Enkelt celle fra Ark2
=SUM(Ark2!A1:B10)             Sum fra Ark2
=Ark1!A1 + Ark2!B5            Kombination af flere ark
=MIDDEL(Salg!C1:C100)         Område fra ark "Salg"
```

**Via museklik:**
1. Skriv `=` i en celle
2. Klik på en anden arkfane → Indsætter `Ark2!`
3. Klik på den ønskede celle → Tilføjer `A1`

### 5.5 Talformater

Via **123-symbolet** i værktøjslinjen:

| Format | Eksempel | Beskrivelse |
|--------|---------|------------|
| Standard | 1234.5 | Ingen formatering |
| Tal | 1.234,56 | Format med 2 decimaler |
| Valuta | 1.234,56 kr | Valutaformat |
| Procent | 12,5% | Værdi × 100 med %-tegn |
| Tusinder | 1.234 | Heltal med tusindtalsseparator |
| Dato | 24-02-2026 | Datoformat |

### 5.6 Flet Celler

1. Vælg celleområde
2. **Indsæt → Flet celler**
3. Kun værdien i øverste venstre celle bevares

**Opdel:** **Indsæt → Opdel celler**

### 5.7 Betinget Formatering

1. Vælg område
2. **Rediger → Betinget formatering...**
3. Vælg regel: Større end / Mindre end / Lig med / Mellem / Tekst indeholder
4. Vælg tekst- og baggrundsfarver
5. **Tilføj**

**Fjern:** Vælg område → **Rediger → Fjern betinget formatering**

### 5.8 Frys Ruder

1. Vælg celle hvorfra der skal rulles
2. **Vis → Frys ruder**
3. Alle rækker ovenfor og kolonner til venstre fryses

**Ophæv frys:** **Vis → Ophæv frys**

### 5.9 Kommentarer

1. Vælg celle → **Indsæt → Tilføj kommentar** → Skriv tekst → OK
2. Celler med kommentarer viser en **rød trekant** øverst til højre

### 5.10 Find og Erstat

`Ctrl + F` eller **Rediger → Find og Erstat**:
- **Find**: Naviger ◀ ▶
- **Erstat**: Enkeltvis eller alle på én gang

### 5.11 Indsæt/Slet Rækker og Kolonner

Via menuen **Indsæt**: Indsæt række ovenfor/nedenfor, kolonne til venstre/højre, slet række/kolonne.

### 5.12 Statuslinje

Nederst vises automatisk statistik for flervælg:

```
Σ Sum: 12.345   ⌀ Mid.: 1.234   ↓ Min: 100   ↑ Maks: 5.000   Antal: 10
```

### 5.13 Import / Export

| Funktion | Format | Beskrivelse |
|----------|--------|------------|
| Import | `.xlsx`, `.xlsm` | Åbn Excel-filer |
| CSV-import | `.csv` | Komma-/semikolonseparerede filer |
| Export | `.xlsx` | Gem som Excel-fil |
| CSV-export | `.csv` | Gem som CSV (UTF-8, semikolon) |
| Udskriv / PDF | — | Udskriftsvisning, kun udfyldte rækker |
| Indsæt billede | PNG, JPG | Indlejr billede i regneark |

### 5.14 AI-funktioner

#### AI-formelgenerator
Klik på **✨** ved formellinjen:
> "Beregn gennemsnittet af alle positive værdier i kolonne B"
> → `=MIDDEL.HVIS(B:B;">0")`

#### AI-tabelassistent
> "Opret en månedlig salgstabel for 2025 med kolonner: Måned, Omsætning, Omkostninger, Profit"

### 5.15 Genvejoversigt

| Genvej | Funktion |
|--------|----------|
| `Ctrl + Z` | Fortryd |
| `Ctrl + Y` | Gentag |
| `Ctrl + C` | Kopiér |
| `Ctrl + V` | Sæt ind |
| `Ctrl + X` | Klip |
| `Ctrl + B` | Fed |
| `Ctrl + I` | Kursiv |
| `Ctrl + U` | Understreget |
| `Ctrl + F` | Find og Erstat |
| `F2` | Rediger celle |
| `Enter` | Bekræft + ned |
| `Tab` | Bekræft + højre |
| `Escape` | Annuller |
| `Del` | Ryd indhold |
| `Shift + Klik` | Udvid markering |

---

## 6. SEPShow – Præsentationer

SEPShow er en diasbaseret præsentationseditor bygget på **Konva** (canvas-renderer).

### 6.1 Interface

| Område | Beskrivelse |
|--------|------------|
| **Venstre sidepanel** | Dialiste – forhåndsvisning, ændre rækkefølge via træk |
| **Hovedområde** | Canvas-editor for aktivt dias |
| **Værktøjslinje** | Værktøjer, eksport, præsentationstilstand |
| **Præsentantnoter** | Noter for aktuelt dias |

### 6.2 Præsentationstilstand

Klik på **Præsentér** for fuldskærmspræsentation:
- Navigation: piletaster `→` / `←` eller klik
- `Esc` afslutter præsentationstilstand

---

## 7. Eliot – AI-assistent

Eliot er den indbyggede AI-assistent tilgængelig i alle tre apps.

### 7.1 Chat-widget

**Det flydende Eliot-symbol** befinder sig nederst til højre i alle apps.

#### Statusindikatorer

| Symbol | Status |
|--------|--------|
| 💬 (normal) | AI klar |
| ⏳ (roterende) | AI indlæses |
| ❌ (rød) | Fejl eller ingen forbindelse |

---

## 8. Indstillinger

### AI-indstillinger
| Indstilling | Beskrivelse |
|------------|------------|
| **API-URL** | URL til AI-backend (standard: `http://localhost:8080`) |
| **API-nøgle** | Valgfri, til eksterne AI-API'er |
| **Test forbindelse** | Kontrollerer om AI-tjenesten er tilgængelig |

### Sprog
SEPOffice understøtter **29 sprog**. Sproget kan vælges i indstillingsdialogboksen.

---

## 9. Tastaturgenveje

### Globalt

| Genvej | Funktion |
|--------|----------|
| `Ctrl + Z` | Fortryd |
| `Ctrl + Y` | Gentag |
| `Ctrl + S` | Gem |

### SEPGrid

| Genvej | Funktion |
|--------|----------|
| `Enter` | Bekræft celle, ned |
| `Tab` | Bekræft celle, højre |
| `Escape` | Annuller redigering |
| `Ctrl + C` | Kopiér |
| `Ctrl + V` | Sæt ind |
| `F2` | Rediger celle |
| Piletaster | Naviger i celler |

---

## Tekniske Bemærkninger

- **Datalagring:** Alle dokumenter gemmes lokalt i browserlager. Ingen data sendes til eksterne servere.
- **AI-model:** Qwen2.5-0.5B kører helt lokalt – ingen internetforbindelse kræves til AI-funktioner.
- **Systemkrav:** Windows 10/11, min. 4 GB RAM (8 GB anbefalet til AI-modellen)

---

*SEPOffice v1.0.1 · Simon Erich Plath · SEP Interactive · 2026*
