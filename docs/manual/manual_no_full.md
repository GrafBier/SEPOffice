# SEPOffice – Brukermanual

**Versjon 1.0.1 · Simon Erich Plath · © 2026 SEP Interactive**

---

## Innholdsfortegnelse

1. [Oversikt](#1-oversikt)
2. [Installasjon og Start](#2-installasjon-og-start)
3. [Kontrollpanel](#3-kontrollpanel)
4. [SEPWrite – Tekstbehandling](#4-sepwrite--tekstbehandling)
5. [SEPGrid – Regneark](#5-sepgrid--regneark)
6. [SEPShow – Presentasjoner](#6-sepshow--presentasjoner)
7. [Eliot – AI-assistent](#7-eliot--ai-assistent)
8. [Innstillinger](#8-innstillinger)
9. [Tastatursnarveier](#9-tastatursnarveier)

---

## 1. Oversikt

SEPOffice er en AI-støttet skrivebordskontorlpakke for Windows bestående av tre integrerte apper:

| App | Funksjon |
|-----|----------|
| **SEPWrite** | Lag rich-text dokumenter, eksporter til Word/PDF |
| **SEPGrid** | Regneark med formler og diagrammer |
| **SEPShow** | Presentasjoner med canvas-editor |

Alle tre apper er koblet til **Eliot** – en innebygd AI-assistent som formulerer tekster, genererer formler og designer lysbilder.

---

## 2. Installasjon og Start

### Installasjonsprogram
Kjør `SEPOffice Setup 1.0.1.exe`. Veiviseren leder deg gjennom installasjonen:
- Valgbar installasjonsmappe (standard: `Program Files\SEPOffice`)
- Oppretter startmeny-element
- Valgfri snarvei på skrivebordet

### Direkte Start (uten installasjon)
Kjør `release\win-unpacked\SEPOffice.exe`.

### Første Start
Ved første start laster AI-tjenesten inn språkmodellen (Qwen2.5-0.5B) i bakgrunnen. Fremgangen er synlig i Eliots chat-widget nederst til høyre. Avhengig av maskinvaren tar dette **1–5 minutter**.

> **Merk:** Appen er umiddelbart brukbar – Eliot aktiveres når fremdriftslinjen når 100%.

---

## 3. Kontrollpanel

Kontrollpanelet er SEPOffice sin startside.

### Tre App-fliser
- **SEPWrite** – Opprett eller åpne dokument
- **SEPGrid** – Opprett eller åpne regneark
- **SEPShow** – Opprett eller åpne presentasjon

### Siste Dokumenter
Under flisene vises sist redigerte dokumenter med type-ikon, navn og dato for siste endring.

### Navigering

| Element | Funksjon |
|---------|----------|
| **SEPWrite / SEPGrid / SEPShow** | Bytte mellom apper |
| ⚙️ | Åpne innstillinger |
| ⌨️ | Vis tastatursnarveier |
| 🌙 / ☀️ | Bytte mørk/lys modus |

---

## 4. SEPWrite – Tekstbehandling

SEPWrite er en moderne rich-text-editor bygget på **TipTap**.

### 4.1 Formatering

| Symbol | Funksjon | Snarvei |
|--------|----------|---------|
| **F** | Fet | `Ctrl + B` |
| *K* | Kursiv | `Ctrl + I` |
| <u>U</u> | Understreket | `Ctrl + U` |
| O1 | Overskrift 1 | — |
| O2 | Overskrift 2 | — |

### 4.2 Sett inn Bilder
Via **Sett inn → Bilde**: opplasting via dra eller filvalg.

### 4.3 Lagre og Eksporter

| Handling | Beskrivelse |
|----------|------------|
| **Lagre** | Automatisk lagring i lokal nettleserlagring |
| **Eksporter som .docx** | Last ned Word-kompatibelt dokument |
| **Skriv ut / PDF** | Utskriftsforhåndsvisning, deretter skriv ut eller lagre som PDF |

---

## 5. SEPGrid – Regneark

SEPGrid er et kraftfullt regneark med **10 000 rader × 26 kolonner** per ark – likt Microsoft Excel og OpenOffice Calc.

### 5.1 Grunnleggende Bruk

| Handling | Beskrivelse |
|----------|------------|
| Klikk på celle | Velg celle |
| Dobbeltklikk / F2 | Rediger celle |
| `Enter` | Bekreft, gå til neste rad |
| `Tab` | Bekreft, gå til neste kolonne |
| `Escape` | Avbryt redigering |
| `Ctrl + Z` | Angre |
| `Ctrl + Y` | Utfør på nytt |
| `Ctrl + C` | Kopier |
| `Ctrl + V` | Lim inn |
| `Ctrl + X` | Klipp ut |
| `Ctrl + B` | Fet |
| `Ctrl + I` | Kursiv |
| `Ctrl + U` | Understreket |
| `Ctrl + F` | Søk og Erstatt |
| `Del` | Tøm celleinnhold |

**Flervalg:** Dra musen eller `Shift + Klikk`.

**Fyllhåndtak:** Dra den blå firkanten i cellens nederste høyre hjørne for å kopiere verdier eller formler.

### 5.2 Formellinjen

```
┌─────────┬────┬───────────────────────────────────────────┐
│   A1    │ fx │  =SUMMER(A1:A10)                          │
└─────────┴────┴───────────────────────────────────────────┘
  ↑          ↑              ↑
  Celleadr.   Symbol          Inndatafelt (viser råformelen)
```

- **Celleadresse**: Viser aktiv celle eller valgt område (f.eks. `A1:B5`)
- **Symbol fx**: Indikerer formelinndata
- **Inndatafelt**: Viser alltid råformelen – ikke resultatet

**Feilvisning:** Ved formelfeil som `#FEIL`, `#REF!`, `#DEL/0!` osv. markeres feltet med rød ramme og feilen vises til høyre.

### 5.3 Skrive inn Formler

Formelinndata starter alltid med `=`:

```
=SUMMER(A1:A10)            Summering
=GJENNOMSNITT(B1:B5)       Gjennomsnitt
=MAKS(C1:C100)             Maksimum
=MIN(D1:D50)               Minimum
=ANTALL(A:A)               Telling
=HVIS(A1>0;"Ja";"Nei")     Betingelse
=FINN.RAD(...)             Loddrett oppslag
=AVRUND(A1; 2)             Avrunding
```

#### Formelreferanser via Museklikk

1. Skriv `=` eller en funksjon som `=SUMMER(`
2. Klikk på ønsket celle → Adressen settes inn
3. Dra for områder → Området settes inn (f.eks. `A1:B10`)

### 5.4 Formler Mellom Ark

Referanser til andre ark – akkurat som i Excel:

```
=Ark2!A1                      Enkelt celle fra Ark2
=SUMMER(Ark2!A1:B10)          Summering fra Ark2
=Ark1!A1 + Ark2!B5            Kombinasjon av flere ark
=GJENNOMSNITT(Salg!C1:C100)   Område fra ark "Salg"
```

**Via museklikk:**
1. Skriv `=` i en celle
2. Klikk på en annen arkfane → Setter inn `Ark2!`
3. Klikk på ønsket celle → Legger til `A1`

### 5.5 Tallformater

Via **123-symbolet** i verktøylinjen:

| Format | Eksempel | Beskrivelse |
|--------|---------|------------|
| Standard | 1234.5 | Ingen formatering |
| Tall | 1 234,56 | Format med 2 desimaler |
| Valuta | 1 234,56 kr | Valutaformat |
| Prosent | 12,5% | Verdi × 100 med %-tegn |
| Tusener | 1 234 | Heltall med tusenavskiller |
| Dato | 24.02.2026 | Datoformat |

### 5.6 Slå sammen Celler

1. Velg celleområde
2. **Sett inn → Slå sammen celler**
3. Bare verdien i øverste venstre celle beholdes

**Del opp:** **Sett inn → Del opp celler**

### 5.7 Betinget Formatering

1. Velg område
2. **Rediger → Betinget formatering...**
3. Velg regel: Større enn / Mindre enn / Lik med / Mellom / Tekst inneholder
4. Velg tekst- og bakgrunnsfarger
5. **Legg til**

**Fjern:** Velg område → **Rediger → Fjern betinget formatering**

### 5.8 Frys Ruter

1. Velg celle hvorfra det skal rulles
2. **Vis → Frys ruter**
3. Alle rader ovenfor og kolonner til venstre fryses

**Opphev frys:** **Vis → Opphev frys**

### 5.9 Kommentarer

1. Velg celle → **Sett inn → Legg til kommentar** → Skriv tekst → OK
2. Celler med kommentarer viser en **rød trekant** øverst til høyre

### 5.10 Søk og Erstatt

`Ctrl + F` eller **Rediger → Søk og Erstatt**:
- **Søk**: Naviger ◀ ▶
- **Erstatt**: Enkeltvis eller alle på én gang

### 5.11 Sett inn/Slett Rader og Kolonner

Via menyen **Sett inn**: Sett inn rad ovenfor/nedenfor, kolonne til venstre/høyre, slett rad/kolonne.

### 5.12 Statuslinje

Nederst vises automatisk statistikk for flervalg:

```
Σ Sum: 12 345   ⌀ Gj.sn.: 1 234   ↓ Min: 100   ↑ Maks: 5 000   Antall: 10
```

### 5.13 Import / Eksport

| Funksjon | Format | Beskrivelse |
|----------|--------|------------|
| Import | `.xlsx`, `.xlsm` | Åpne Excel-filer |
| CSV-import | `.csv` | Komma-/semikolonseparerte filer |
| Eksport | `.xlsx` | Lagre som Excel-fil |
| CSV-eksport | `.csv` | Lagre som CSV (UTF-8, semikolon) |
| Skriv ut / PDF | — | Utskriftsforhåndsvisning, bare utfylte rader |
| Sett inn bilde | PNG, JPG | Bygg inn bilde i regneark |

### 5.14 AI-funksjoner

#### AI-formelgenerator
Klikk på **✨** ved formellinjen:
> "Beregn gjennomsnittet av alle positive verdier i kolonne B"
> → `=GJENNOMSNITT.HVIS(B:B;">0")`

#### AI-tabelassistent
> "Lag en månedlig salgstabell for 2025 med kolonner: Måned, Omsetning, Kostnader, Fortjeneste"

### 5.15 Snarveisoversikt

| Snarvei | Funksjon |
|---------|----------|
| `Ctrl + Z` | Angre |
| `Ctrl + Y` | Utfør på nytt |
| `Ctrl + C` | Kopier |
| `Ctrl + V` | Lim inn |
| `Ctrl + X` | Klipp ut |
| `Ctrl + B` | Fet |
| `Ctrl + I` | Kursiv |
| `Ctrl + U` | Understreket |
| `Ctrl + F` | Søk og Erstatt |
| `F2` | Rediger celle |
| `Enter` | Bekreft + ned |
| `Tab` | Bekreft + høyre |
| `Escape` | Avbryt |
| `Del` | Tøm innhold |
| `Shift + Klikk` | Utvid valg |

---

## 6. SEPShow – Presentasjoner

SEPShow er en lysbildebasert presentasjonseditor bygget på **Konva** (canvas-renderer).

### 6.1 Grensesnitt

| Område | Beskrivelse |
|--------|------------|
| **Venstre sidepanel** | Lysbildeliste – forhåndsvisning, endre rekkefølge via dra |
| **Hovedområde** | Canvas-editor for aktivt lysbilde |
| **Verktøylinje** | Verktøy, eksport, presentasjonsmodus |
| **Presentatørnotater** | Notater for gjeldende lysbilde |

### 6.2 Presentasjonsmodus

Klikk på **Presenter** for fullskjermspresentasjon:
- Navigering: piltaster `→` / `←` eller klikk
- `Esc` avslutter presentasjonsmodus

---

## 7. Eliot – AI-assistent

Eliot er den innebygde AI-assistenten tilgjengelig i alle tre apper.

### 7.1 Chat-widget

**Det flytende Eliot-symbolet** befinner seg nederst til høyre i alle apper.

#### Statusindikatorer

| Symbol | Status |
|--------|--------|
| 💬 (normal) | AI klar |
| ⏳ (roterende) | AI lastes inn |
| ❌ (rød) | Feil eller ingen tilkobling |

---

## 8. Innstillinger

### AI-innstillinger
| Innstilling | Beskrivelse |
|------------|------------|
| **API-URL** | URL til AI-backend (standard: `http://localhost:8080`) |
| **API-nøkkel** | Valgfri, for eksterne AI-API-er |
| **Test tilkobling** | Sjekker om AI-tjenesten er tilgjengelig |

### Språk
SEPOffice støtter **29 språk**. Språket kan velges i innstillingsdialogboksen.

---

## 9. Tastatursnarveier

### Globalt

| Snarvei | Funksjon |
|---------|----------|
| `Ctrl + Z` | Angre |
| `Ctrl + Y` | Utfør på nytt |
| `Ctrl + S` | Lagre |

### SEPGrid

| Snarvei | Funksjon |
|---------|----------|
| `Enter` | Bekreft celle, ned |
| `Tab` | Bekreft celle, høyre |
| `Escape` | Avbryt redigering |
| `Ctrl + C` | Kopier |
| `Ctrl + V` | Lim inn |
| `F2` | Rediger celle |
| Piltaster | Naviger i celler |

---

## Tekniske Merknader

- **Datalagring:** Alle dokumenter lagres lokalt i nettleserlagringen. Ingen data sendes til eksterne servere.
- **AI-modell:** Qwen2.5-0.5B kjører helt lokalt – ingen internettilkobling kreves for AI-funksjoner.
- **Systemkrav:** Windows 10/11, min. 4 GB RAM (8 GB anbefalt for AI-modellen)

---

*SEPOffice v1.0.1 · Simon Erich Plath · SEP Interactive · 2026*
