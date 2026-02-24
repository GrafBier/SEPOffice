# SEPOffice – Användarmanual

**Version 1.0.1 · Simon Erich Plath · © 2026 SEP Interactive**

---

## Innehållsförteckning

1. [Översikt](#1-översikt)
2. [Installation och Start](#2-installation-och-start)
3. [Instrumentpanel](#3-instrumentpanel)
4. [SEPWrite – Ordbehandling](#4-sepwrite--ordbehandling)
5. [SEPGrid – Kalkylblad](#5-sepgrid--kalkylblad)
6. [SEPShow – Presentationer](#6-sepshow--presentationer)
7. [Eliot – AI-assistent](#7-eliot--ai-assistent)
8. [Inställningar](#8-inställningar)
9. [Tangentbordsgenvägar](#9-tangentbordsgenvägar)

---

## 1. Översikt

SEPOffice är ett AI-stödd skrivbordskontorspaket för Windows, bestående av tre integrerade program:

| Program | Funktion |
|---------|----------|
| **SEPWrite** | Skapa rik textdokument, exportera till Word/PDF |
| **SEPGrid** | Kalkylblad med formler och diagram |
| **SEPShow** | Presentationer med canvas-redigerare |

Alla tre program är anslutna till **Eliot** – en inbyggd AI-assistent som formulerar texter, genererar formler och designar bilder.

---

## 2. Installation och Start

### Installationsprogram
Kör `SEPOffice Setup 1.0.1.exe`. Guiden leder dig genom installationen:
- Valbar installationsmapp (standard: `Program Files\SEPOffice`)
- Skapar startmenypost
- Valfri skrivbordsgenväg

### Direkt Start (utan installation)
Kör `release\win-unpacked\SEPOffice.exe`.

### Första Start
Vid första start laddar AI-tjänsten språkmodellen (Qwen2.5-0.5B) i bakgrunden. Förloppet visas i Eliots chattwidget nedre höger. Beroende på maskinvaran tar detta **1–5 minuter**.

> **Obs:** Appen är omedelbart användbar – Eliot aktiveras när förloppsfältet når 100%.

---

## 3. Instrumentpanel

Instrumentpanelen är SEPOffice startsida.

### Tre Appbrickor
- **SEPWrite** – Skapa eller öppna dokument
- **SEPGrid** – Skapa eller öppna kalkylblad
- **SEPShow** – Skapa eller öppna presentation

### Senaste Dokument
Under brickorna visas senast redigerade dokument med typikon, namn och datum för senaste ändring.

### Navigering

| Element | Funktion |
|---------|----------|
| **SEPWrite / SEPGrid / SEPShow** | Byta mellan program |
| ⚙️ | Öppna inställningar |
| ⌨️ | Visa tangentbordsgenvägar |
| 🌙 / ☀️ | Byta mörkt/ljust läge |

---

## 4. SEPWrite – Ordbehandling

SEPWrite är en modern rik textredigerare baserad på **TipTap**.

### 4.1 Formatering

| Symbol | Funktion | Genväg |
|--------|----------|--------|
| **F** | Fet | `Ctrl + B` |
| *K* | Kursiv | `Ctrl + I` |
| <u>U</u> | Understruken | `Ctrl + U` |
| R1 | Rubrik 1 | — |
| R2 | Rubrik 2 | — |

### 4.2 Infoga Bilder
Via **Infoga → Bild**: uppladdning via drag eller filval.

### 4.3 Spara och Exportera

| Åtgärd | Beskrivning |
|--------|------------|
| **Spara** | Automatisk sparning i lokal webbläsarlagring |
| **Exportera som .docx** | Ladda ner Word-kompatibelt dokument |
| **Skriv ut / PDF** | Förhandsgranska, sedan skriva ut eller spara som PDF |

---

## 5. SEPGrid – Kalkylblad

SEPGrid är ett kraftfullt kalkylblad med **10 000 rader × 26 kolumner** per ark – liknande Microsoft Excel och OpenOffice Calc.

### 5.1 Grundläggande Hantering

| Åtgärd | Beskrivning |
|--------|------------|
| Klicka på cell | Välja cell |
| Dubbelklick / F2 | Redigera cell |
| `Enter` | Bekräfta, gå till nästa rad |
| `Tab` | Bekräfta, gå till nästa kolumn |
| `Escape` | Avbryt redigering |
| `Ctrl + Z` | Ångra |
| `Ctrl + Y` | Gör om |
| `Ctrl + C` | Kopiera |
| `Ctrl + V` | Klistra in |
| `Ctrl + X` | Klipp ut |
| `Ctrl + B` | Fet |
| `Ctrl + I` | Kursiv |
| `Ctrl + U` | Understruken |
| `Ctrl + F` | Sök och Ersätt |
| `Del` | Rensa cellinnehåll |

**Flervalsmarkering:** Dra musen eller `Shift + Klick`.

**Fyllningshandtag:** Dra den blå kvadraten nedre höger i en cell för att kopiera värden eller formler.

### 5.2 Formelfältet

```
┌─────────┬────┬───────────────────────────────────────────┐
│   A1    │ fx │  =SUMMA(A1:A10)                           │
└─────────┴────┴───────────────────────────────────────────┘
  ↑          ↑              ↑
  Celladress  Symbol          Inmatningsfält (visar råformeln)
```

- **Celladress**: Visar aktiv cell eller markerat område (t.ex. `A1:B5`)
- **Symbol fx**: Anger formelinmatning
- **Inmatningsfält**: Visar alltid råformeln – inte resultatet

**Felvisning:** Vid formelfel som `#FEL`, `#REF!`, `#DIV/0!` osv. markeras fältet med röd ram och felet visas till höger.

### 5.3 Mata In Formler

Formelinmatning börjar alltid med `=`:

```
=SUMMA(A1:A10)             Summa
=MEDEL(B1:B5)              Medelvärde
=MAX(C1:C100)              Maximum
=MIN(D1:D50)               Minimum
=ANTAL(A:A)                Antal
=OM(A1>0;"Ja";"Nej")       Villkor
=LETAUPP.LODR(...)         Lodrät sökning
=AVRUNDA(A1; 2)            Avrundning
```

#### Formelreferenser via Musklick

1. Skriv `=` eller en funktion som `=SUMMA(`
2. Klicka på önskad cell → Adressen infogas
3. Dra för områden → Området infogas (t.ex. `A1:B10`)

### 5.4 Formler Mellan Ark

Hänvisningar till andra ark – precis som i Excel:

```
=Blad2!A1                     Enskild cell från Blad2
=SUMMA(Blad2!A1:B10)          Summa från Blad2
=Blad1!A1 + Blad2!B5          Kombination av flera ark
=MEDEL(Försäljning!C1:C100)   Område från ark "Försäljning"
```

**Via musklick:**
1. Skriv `=` i en cell
2. Klicka på en annan arkflik → Infogar `Blad2!`
3. Klicka på önskad cell → Lägger till `A1`

### 5.5 Talformat

Via **123-symbolen** i verktygsfältet:

| Format | Exempel | Beskrivning |
|--------|---------|------------|
| Standard | 1234.5 | Ingen formatering |
| Tal | 1 234,56 | Format med 2 decimaler |
| Valuta | 1 234,56 kr | Valutaformat |
| Procent | 12,5% | Värde × 100 med %-tecken |
| Tusental | 1 234 | Heltal med tusenavskiljare |
| Datum | 2026-02-24 | Datumformat |

### 5.6 Sammanfoga Celler

1. Markera cellområde
2. **Infoga → Sammanfoga celler**
3. Bara värdet i övre vänstra cellen bevaras

**Dela upp:** **Infoga → Dela celler**

### 5.7 Villkorsstyrd Formatering

1. Markera område
2. **Redigera → Villkorsstyrd formatering...**
3. Välj regel: Större än / Mindre än / Lika med / Mellan / Text innehåller
4. Välj text- och bakgrundsfärger
5. **Lägg till**

**Ta bort:** Markera område → **Redigera → Ta bort villkorsstyrd formatering**

### 5.8 Lås Rutor

1. Markera cell varifrån scrollning ska ske
2. **Visa → Lås rutor**
3. Alla rader ovanför och kolumner till vänster låses

**Lås upp:** **Visa → Lås upp rutor**

### 5.9 Kommentarer

1. Markera cell → **Infoga → Lägg till kommentar** → Skriv text → OK
2. Celler med kommentarer visar en **röd triangel** i övre höger hörn

### 5.10 Sök och Ersätt

`Ctrl + F` eller **Redigera → Sök och Ersätt**:
- **Sök**: Navigering ◀ ▶
- **Ersätt**: En i taget eller alla

### 5.11 Infoga/Ta bort Rader och Kolumner

Via menyn **Infoga**: Infoga rad ovan/nedan, kolumn vänster/höger, ta bort rad/kolumn.

### 5.12 Statusfält

Nedtill visas automatiskt statistik för flervalda celler:

```
Σ Summa: 12 345   ⌀ Medel: 1 234   ↓ Min: 100   ↑ Max: 5 000   Antal: 10
```

### 5.13 Import / Export

| Funktion | Format | Beskrivning |
|----------|--------|------------|
| Import | `.xlsx`, `.xlsm` | Öppna Excelfiler |
| CSV-import | `.csv` | Komma-/semikolavseparerade filer |
| Export | `.xlsx` | Spara som Excelfil |
| CSV-export | `.csv` | Spara som CSV (UTF-8, semikolon) |
| Skriv ut / PDF | — | Förhandsgranska, bara ifyllda rader |
| Infoga bild | PNG, JPG | Bädda in bild i kalkylblad |

### 5.14 AI-funktioner

#### AI-formelgenerator
Klicka på **✨** vid formelfältet:
> "Beräkna medelvärdet av alla positiva värden i kolumn B"
> → `=MEDEL.OM(B:B;">0")`

#### AI-tabelassistent
> "Skapa en månadsvis försäljningstabell för 2025 med kolumnerna: Månad, Intäkter, Kostnader, Vinst"

### 5.15 Genvägsöversikt

| Genväg | Funktion |
|--------|----------|
| `Ctrl + Z` | Ångra |
| `Ctrl + Y` | Gör om |
| `Ctrl + C` | Kopiera |
| `Ctrl + V` | Klistra in |
| `Ctrl + X` | Klipp ut |
| `Ctrl + B` | Fet |
| `Ctrl + I` | Kursiv |
| `Ctrl + U` | Understruken |
| `Ctrl + F` | Sök och Ersätt |
| `F2` | Redigera cell |
| `Enter` | Bekräfta + ned |
| `Tab` | Bekräfta + höger |
| `Escape` | Avbryt |
| `Del` | Rensa innehåll |
| `Shift + Klick` | Utöka markering |

---

## 6. SEPShow – Presentationer

SEPShow är en bildbaserad presentationsredigerare baserad på **Konva** (canvas-renderare).

### 6.1 Gränssnitt

| Område | Beskrivning |
|--------|------------|
| **Vänster sidopanel** | Bildlista – förhandsvisning, ändra ordning via drag |
| **Huvudområde** | Canvas-redigerare för aktiv bild |
| **Verktygsfält** | Verktyg, export, presentationsläge |
| **Presentatörsanteckningar** | Anteckningar för aktuell bild |

### 6.2 Presentationsläge

Klicka på **Presentera** för helskärmspresentation:
- Navigering: piltangenter `→` / `←` eller klickning
- `Esc` avslutar presentationsläget

---

## 7. Eliot – AI-assistent

Eliot är den inbyggda AI-assistenten tillgänglig i alla tre program.

### 7.1 Chattwidget

**Den flytande Eliot-symbolen** finns nedre höger i alla program.

#### Statusindikatorer

| Symbol | Status |
|--------|--------|
| 💬 (normal) | AI redo |
| ⏳ (roterande) | Laddar AI |
| ❌ (röd) | Fel eller ingen anslutning |

---

## 8. Inställningar

### AI-inställningar
| Alternativ | Beskrivning |
|------------|------------|
| **API-URL** | URL till AI-backend (standard: `http://localhost:8080`) |
| **API-nyckel** | Valfri, för externa AI-API:er |
| **Testa anslutning** | Kontrollerar om AI-tjänsten är tillgänglig |

### Språk
SEPOffice stöder **29 språk**. Språket kan väljas i inställningsdialogrutan.

---

## 9. Tangentbordsgenvägar

### Globalt

| Genväg | Funktion |
|--------|----------|
| `Ctrl + Z` | Ångra |
| `Ctrl + Y` | Gör om |
| `Ctrl + S` | Spara |

### SEPGrid

| Genväg | Funktion |
|--------|----------|
| `Enter` | Bekräfta cell, ned |
| `Tab` | Bekräfta cell, höger |
| `Escape` | Avbryt redigering |
| `Ctrl + C` | Kopiera |
| `Ctrl + V` | Klistra in |
| `F2` | Redigera cell |
| Piltangenter | Navigera i celler |

---

## Tekniska Anmärkningar

- **Datalagring:** Alla dokument lagras lokalt i webbläsarlagringen. Inga data skickas till externa servrar.
- **AI-modell:** Qwen2.5-0.5B körs helt lokalt – ingen internetanslutning krävs för AI-funktioner.
- **Systemkrav:** Windows 10/11, min. 4 GB RAM (8 GB rekommenderat för AI-modellen)

---

*SEPOffice v1.0.1 · Simon Erich Plath · SEP Interactive · 2026*
