# SEPOffice – Uživatelská Příručka

**Verze 1.0.1 · Simon Erich Plath · © 2026 SEP Interactive**

---

## Obsah

1. [Přehled](#1-přehled)
2. [Instalace a Spuštění](#2-instalace-a-spuštění)
3. [Řídicí Panel](#3-řídicí-panel)
4. [SEPWrite – Textový Editor](#4-sepwrite--textový-editor)
5. [SEPGrid – Tabulkový Procesor](#5-sepgrid--tabulkový-procesor)
6. [SEPShow – Prezentace](#6-sepshow--prezentace)
7. [Eliot – AI Asistent](#7-eliot--ai-asistent)
8. [Nastavení](#8-nastavení)
9. [Klávesové Zkratky](#9-klávesové-zkratky)

---

## 1. Přehled

SEPOffice je kancelářský balík pro stolní počítače s podporou AI pro Windows, sestávající ze tří integrovaných aplikací:

| Aplikace | Funkce |
|----------|--------|
| **SEPWrite** | Vytváření dokumentů s formátovaným textem, export do Word/PDF |
| **SEPGrid** | Tabulkový procesor s vzorci a grafy |
| **SEPShow** | Prezentace s plátnovým editorem |

Všechny tři aplikace jsou propojeny s **Eliotem** – vestavěným AI asistentem, který formuluje texty, generuje vzorce a navrhuje snímky.

---

## 2. Instalace a Spuštění

### Instalační Program
Spusťte `SEPOffice Setup 1.0.1.exe`. Průvodce vás provede instalací:
- Volitelná instalační složka (výchozí: `Program Files\SEPOffice`)
- Vytvoří položku v nabídce Start
- Volitelný zástupce na ploše

### Přímé Spuštění (bez instalace)
Spusťte `release\win-unpacked\SEPOffice.exe`.

### První Spuštění
Při prvním spuštění служба AI načítá jazykový model (Qwen2.5-0.5B) na pozadí. Průběh je viditelný v widgetu chatu Eliota vpravo dole. V závislosti na hardware to trvá **1–5 minut**.

> **Poznámka:** Aplikace je okamžitě použitelná – Eliot se aktivuje, jakmile lišта průběhu dosáhne 100%.

---

## 3. Řídicí Panel

Řídicí panel je úvodní stránkou SEPOffice.

### Tři Dlaždice Aplikací
- **SEPWrite** – Vytvoření nebo otevření dokumentu
- **SEPGrid** – Vytvoření nebo otevření tabulky
- **SEPShow** – Vytvoření nebo otevření prezentace

### Nedávné Dokumenty
Pod dlaždicemi se zobrazují naposledy upravené dokumenty s ikonou typu, názvem a datem poslední úpravy.

### Navigace

| Prvek | Funkce |
|-------|--------|
| **SEPWrite / SEPGrid / SEPShow** | Přepínání mezi aplikacemi |
| ⚙️ | Otevření nastavení |
| ⌨️ | Zobrazení klávesových zkratek |
| 🌙 / ☀️ | Přepínání tmavého/světlého režimu |

---

## 4. SEPWrite – Textový Editor

SEPWrite je moderní editor formátovaného textu postavený na **TipTap**.

### 4.1 Formátování

| Symbol | Funkce | Zkratka |
|--------|--------|---------|
| **T** | Tučné | `Ctrl + B` |
| *K* | Kurzíva | `Ctrl + I` |
| <u>P</u> | Podtržení | `Ctrl + U` |
| N1 | Nadpis 1 | — |
| N2 | Nadpis 2 | — |

### 4.2 Vkládání Obrázků
Přes **Vložit → Obrázek**: nahrání přetažením nebo výběrem souboru.

### 4.3 Ukládání a Export

| Akce | Popis |
|------|-------|
| **Uložit** | Automatické ukládání do místního úložiště prohlížeče |
| **Exportovat jako .docx** | Stažení dokumentu kompatibilního s Wordem |
| **Tisk / PDF** | Náhled tisku, pak tisk nebo uložení jako PDF |

---

## 5. SEPGrid – Tabulkový Procesor

SEPGrid je výkonný tabulkový procesor s **10 000 řádky × 26 sloupci** na list – podobný Microsoft Excelu a OpenOffice Calc.

### 5.1 Základní Ovládání

| Akce | Popis |
|------|-------|
| Kliknutí na buňku | Výběr buňky |
| Dvojklik / F2 | Úprava buňky |
| `Enter` | Potvrdit, přejít na další řádek |
| `Tab` | Potvrdit, přejít na další sloupec |
| `Escape` | Zrušit úpravu |
| `Ctrl + Z` | Zpět |
| `Ctrl + Y` | Znovu |
| `Ctrl + C` | Kopírovat |
| `Ctrl + V` | Vložit |
| `Ctrl + X` | Vyjmout |
| `Ctrl + B` | Tučné |
| `Ctrl + I` | Kurzíva |
| `Ctrl + U` | Podtržení |
| `Ctrl + F` | Najít a Nahradit |
| `Del` | Vymazat obsah buňky |

**Vícenásobný výběr:** Přetažení myší nebo `Shift + Kliknout`.

**Úchyt výplně:** Přetažením modrého čtverečku v pravém dolním rohu buňky zkopírujete hodnoty nebo vzorce.

### 5.2 Řádek Vzorců

```
┌─────────┬────┬───────────────────────────────────────────┐
│   A1    │ fx │  =SUMA(A1:A10)                            │
└─────────┴────┴───────────────────────────────────────────┘
  ↑          ↑              ↑
  Adresa bun.  Symbol         Vstupní pole (zobrazuje nezpracovaný vzorec)
```

- **Adresa buňky**: Zobrazuje aktivní buňku nebo vybraný rozsah (např. `A1:B5`)
- **Symbol fx**: Označuje zadání vzorce
- **Vstupní pole**: Vždy zobrazuje nezpracovaný vzorec – nikoli výsledek

**Zobrazení chyb:** Při chybách vzorce jako `#CHYBA`, `#REF!`, `#DĚLENÍ/0!` apod. je pole ohraničeno červeně a chyba zobrazena vpravo.

### 5.3 Zadávání Vzorců

Zadávání vzorce vždy začíná `=`:

```
=SUMA(A1:A10)              Součet
=PRŮMĚR(B1:B5)             Průměr
=MAX(C1:C100)              Maximum
=MIN(D1:D50)               Minimum
=POČET(A:A)                Počet
=KDYŽ(A1>0;"Ano";"Ne")     Podmínka
=SVYHLEDAT(...)            Svislé vyhledávání
=ZAOKR(A1; 2)              Zaokrouhlení
```

#### Odkazování ve Vzorcích Kliknutím Myší

1. Zadejte `=` nebo funkci jako `=SUMA(`
2. Klikněte na požadovanou buňku → Adresa bude vložena
3. Přetažení pro rozsahy → Rozsah bude vložen (např. `A1:B10`)

### 5.4 Vzorce Mezi Listy

Odkazy na jiné listy – stejně jako v Excelu:

```
=List2!A1                       Jediná buňka z List2
=SUMA(List2!A1:B10)             Součet z List2
=List1!A1 + List2!B5            Kombinace více listů
=PRŮMĚR(Prodej!C1:C100)         Rozsah z listu "Prodej"
```

**Kliknutím myší:**
1. Zadejte `=` do buňky
2. Klikněte na jiný záložku listu → Vloží `List2!`
3. Klikněte na požadovanou buňku → Přidá `A1`

### 5.5 Formáty Čísel

Prostřednictvím symbolu **123** na panelu nástrojů:

| Formát | Příklad | Popis |
|--------|---------|-------|
| Standardní | 1234.5 | Bez formátování |
| Číslo | 1 234,56 | Formát s 2 desetinnými místy |
| Měna | 1 234,56 Kč | Formát měny |
| Procento | 12,5 % | Hodnota × 100 se znakem % |
| Tisíce | 1 234 | Celá čísla s oddělovačem tisíců |
| Datum | 24.02.2026 | Formát data |

### 5.6 Sloučení Buněk

1. Vyberte rozsah buněk
2. **Vložit → Sloučit buňky**
3. Zachová se pouze hodnota levé horní buňky

**Zrušení sloučení:** **Vložit → Zrušit sloučení**

### 5.7 Podmíněné Formátování

1. Vyberte rozsah
2. **Upravit → Podmíněné formátování...**
3. Zvolte pravidlo: Větší než / Menší než / Rovno / Mezi / Text obsahuje
4. Zvolte barvy textu a pozadí
5. **Přidat**

**Odebrání:** Vyberte rozsah → **Upravit → Odebrat podmíněné formátování**

### 5.8 Ukotvení Příček

1. Vyberte buňku, od které má začínat posouvání
2. **Zobrazit → Ukotvit příčky**
3. Všechny řádky výše a sloupce vlevo budou ukotveny

**Zrušení ukotvení:** **Zobrazit → Zrušit ukotvení příček**

### 5.9 Komentáře

1. Vyberte buňku → **Vložit → Přidat komentář** → Zadejte text → OK
2. Buňky s komentáři zobrazují **červený trojúhelník** v pravém horním rohu

### 5.10 Najít a Nahradit

`Ctrl + F` nebo **Upravit → Najít a Nahradit**:
- **Najít**: Navigace ◀ ▶
- **Nahradit**: Jednotlivě nebo vše najednou

### 5.11 Vkládání/Mazání Řádků a Sloupců

Přes menu **Vložit**: Vložit řádek výše/níže, sloupec vlevo/vpravo, odstranit řádek/sloupec.

### 5.12 Stavový Řádek

Dole se automaticky zobrazují statistiky pro vícenásobný výběr:

```
Σ Součet: 12 345   ⌀ Prům.: 1 234   ↓ Min: 100   ↑ Max: 5 000   Počet: 10
```

### 5.13 Import / Export

| Funkce | Formát | Popis |
|--------|--------|-------|
| Import | `.xlsx`, `.xlsm` | Otevření souborů Excel |
| Import CSV | `.csv` | Soubory oddělené čárkou/středníkem |
| Export | `.xlsx` | Uložení jako soubor Excel |
| Export CSV | `.csv` | Uložení jako CSV (UTF-8, středník) |
| Tisk / PDF | — | Náhled tisku, pouze vyplněné řádky |
| Vložit obrázek | PNG, JPG | Vložení obrázku do tabulky |

### 5.14 Funkce AI

#### Generátor Vzorců AI
Klikněte na **✨** u řádku vzorců:
> "Vypočítej průměr všech kladných hodnot ve sloupci B"
> → `=PRŮMĚR.KDYŽ(B:B;">0")`

#### AI Asistent Tabulek
> "Vytvoř měsíční tabulku prodeje za rok 2025 se sloupci: Měsíc, Příjmy, Náklady, Zisk"

### 5.15 Přehled Klávesových Zkratek

| Zkratka | Funkce |
|---------|--------|
| `Ctrl + Z` | Zpět |
| `Ctrl + Y` | Znovu |
| `Ctrl + C` | Kopírovat |
| `Ctrl + V` | Vložit |
| `Ctrl + X` | Vyjmout |
| `Ctrl + B` | Tučné |
| `Ctrl + I` | Kurzíva |
| `Ctrl + U` | Podtržení |
| `Ctrl + F` | Najít a Nahradit |
| `F2` | Upravit buňku |
| `Enter` | Potvrdit + dolů |
| `Tab` | Potvrdit + vpravo |
| `Escape` | Zrušit |
| `Del` | Vymazat obsah |
| `Shift + Klic` | Rozšířit výběr |

---

## 6. SEPShow – Prezentace

SEPShow je editor snímkové prezentace postavený na **Konva** (vykreslovač plátna).

### 6.1 Rozhraní

| Oblast | Popis |
|--------|-------|
| **Levý postranní panel** | Seznam snímků – náhled, změna pořadí přetažením |
| **Hlavní oblast** | Plátněný editor aktivního snímku |
| **Panel nástrojů** | Nástroje, export, režim prezentace |
| **Poznámky přednášejícího** | Poznámky pro aktuální snímek |

### 6.2 Režim Prezentace

Klikněte na **Prezentovat** pro prezentaci na celou obrazovku:
- Navigace: šipky `→` / `←` nebo kliknutí
- `Esc` ukončí režim prezentace

---

## 7. Eliot – AI Asistent

Eliot je vestavěný AI asistent dostupný ve všech třech aplikacích.

### 7.1 Widget Chatu

**Plovoucí symbol Eliota** se nachází vpravo dole ve všech aplikacích.

#### Stavové Indikátory

| Symbol | Stav |
|--------|------|
| 💬 (normální) | AI připraven |
| ⏳ (točící se) | Načítání AI |
| ❌ (červený) | Chyba nebo žádné připojení |

---

## 8. Nastavení

### Nastavení AI
| Možnost | Popis |
|---------|-------|
| **URL API** | URL backendu AI (výchozí: `http://localhost:8080`) |
| **Klíč API** | Volitelný, pro externí AI API |
| **Test připojení** | Zkontroluje, zda je služba AI dostupná |

### Jazyk
SEPOffice podporuje **29 jazyků**. Jazyk lze vybrat v dialogovém okně nastavení.

---

## 9. Klávesové Zkratky

### Globální

| Zkratka | Funkce |
|---------|--------|
| `Ctrl + Z` | Zpět |
| `Ctrl + Y` | Znovu |
| `Ctrl + S` | Uložit |

### SEPGrid

| Zkratka | Funkce |
|---------|--------|
| `Enter` | Potvrdit buňku, dolů |
| `Tab` | Potvrdit buňku, vpravo |
| `Escape` | Zrušit úpravu |
| `Ctrl + C` | Kopírovat |
| `Ctrl + V` | Vložit |
| `F2` | Upravit buňku |
| Šipky | Navigace v buňkách |

---

## Technické Poznámky

- **Ukládání dat:** Všechny dokumenty jsou uloženy místně v úložišti prohlížeče. Na externí servery nejsou odesílána žádná data.
- **Model AI:** Qwen2.5-0.5B běží zcela lokálně – pro funkce AI není vyžadováno připojení k internetu.
- **Systémové požadavky:** Windows 10/11, min. 4 GB RAM (8 GB doporučeno pro model AI)

---

*SEPOffice v1.0.1 · Simon Erich Plath · SEP Interactive · 2026*
