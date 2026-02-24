# SEPOffice – Käyttöopas

**Versio 1.0.1 · Simon Erich Plath · © 2026 SEP Interactive**

---

## Sisällysluettelo

1. [Yleiskatsaus](#1-yleiskatsaus)
2. [Asennus ja Käynnistys](#2-asennus-ja-käynnistys)
3. [Ohjauspaneeli](#3-ohjauspaneeli)
4. [SEPWrite – Tekstinkäsittely](#4-sepwrite--tekstinkäsittely)
5. [SEPGrid – Laskentataulukko](#5-sepgrid--laskentataulukko)
6. [SEPShow – Esitykset](#6-sepshow--esitykset)
7. [Eliot – AI-avustaja](#7-eliot--ai-avustaja)
8. [Asetukset](#8-asetukset)
9. [Pikanäppäimet](#9-pikanäppäimet)

---

## 1. Yleiskatsaus

SEPOffice on Windows-käyttöjärjestelmälle tarkoitettu tekoälyllä varustettu toimisto-ohjelmistopaketti, joka koostuu kolmesta integroidusta sovelluksesta:

| Sovellus | Toiminto |
|----------|----------|
| **SEPWrite** | Luo muotoiltuja tekstiasiakirjoja, vie Word/PDF-muotoon |
| **SEPGrid** | Laskentataulukko kaavoilla ja kaavioilla |
| **SEPShow** | Esitykset canvas-editorilla |

Kaikki kolme sovellusta on yhdistetty **Eliotiin** – sisäänrakennettuun tekoälyavustajaan, joka muotoilee tekstejä, luo kaavoja ja suunnittelee dioja.

---

## 2. Asennus ja Käynnistys

### Asennusohjelmisto
Suorita `SEPOffice Setup 1.0.1.exe`. Ohjattu toiminto opastaa asennetun läpi:
- Valittavissa oleva asennuskansio (oletus: `Program Files\SEPOffice`)
- Luo käynnistysvalikkokohteen
- Valinnainen pikakuvake työpöydälle

### Suora Käynnistys (ilman asennusta)
Suorita `release\win-unpacked\SEPOffice.exe`.

### Ensimmäinen Käynnistys
Ensimmäisellä käynnistyskerralla tekoälypalvelu lataa kielimallin (Qwen2.5-0.5B) taustalla. Edistyminen on näkyvissä Eliotin chat-widgetissä oikeassa alakulmassa. Laitteistosta riippuen tämä kestää **1–5 minuuttia**.

> **Huomio:** Sovellus on välittömästi käytettävissä – Eliot aktivoituu, kun edistymispalkki saavuttaa 100%.

---

## 3. Ohjauspaneeli

Ohjauspaneeli on SEPOffice:n aloitussivu.

### Kolme Sovelluslaattaa
- **SEPWrite** – Luo tai avaa asiakirja
- **SEPGrid** – Luo tai avaa laskentataulukko
- **SEPShow** – Luo tai avaa esitys

### Viimeisimmät Asiakirjat
Laattojen alla näkyvät viimeksi muokatut asiakirjat tyyppikuvakkeella, nimellä ja viimeisimmän muokkauksen päivämäärällä.

### Navigointi

| Elementti | Toiminto |
|-----------|----------|
| **SEPWrite / SEPGrid / SEPShow** | Vaihda sovelluksien välillä |
| ⚙️ | Avaa asetukset |
| ⌨️ | Näytä pikanäppäimet |
| 🌙 / ☀️ | Vaihda tumma/vaalea tila |

---

## 4. SEPWrite – Tekstinkäsittely

SEPWrite on moderni muotoiltu tekstieditori, joka perustuu **TipTap**-alustaan.

### 4.1 Muotoilu

| Symboli | Toiminto | Pikakuvake |
|---------|----------|-----------|
| **L** | Lihavoitu | `Ctrl + B` |
| *K* | Kursiivi | `Ctrl + I` |
| <u>A</u> | Alleviivattu | `Ctrl + U` |
| O1 | Otsikko 1 | — |
| O2 | Otsikko 2 | — |

### 4.2 Kuvien Lisääminen
**Lisää → Kuva** -toiminnon kautta: lataaminen vetämällä tai tiedostovalinnalla.

### 4.3 Tallentaminen ja Vieminen

| Toiminto | Kuvaus |
|----------|--------|
| **Tallenna** | Automaattinen tallennus selainmuistiin |
| **Vie .docx-muodossa** | Lataa Word-yhteensopiva asiakirja |
| **Tulosta / PDF** | Tulostuksen esikatselu, sitten tulosta tai tallenna PDF:ksi |

---

## 5. SEPGrid – Laskentataulukko

SEPGrid on tehokas laskentataulukko, jossa on **10 000 riviä × 26 saraketta** per arkki – vastaava kuin Microsoft Excel ja OpenOffice Calc.

### 5.1 Peruskäyttö

| Toiminto | Kuvaus |
|----------|--------|
| Napsauta solua | Valitse solu |
| Kaksoisnapsautus / F2 | Muokkaa solua |
| `Enter` | Vahvista, siirry seuraavalle riville |
| `Tab` | Vahvista, siirry seuraavaan sarakkeeseen |
| `Escape` | Peruuta muokkaus |
| `Ctrl + Z` | Kumoa |
| `Ctrl + Y` | Tee uudelleen |
| `Ctrl + C` | Kopioi |
| `Ctrl + V` | Liitä |
| `Ctrl + X` | Leikkaa |
| `Ctrl + B` | Lihavoitu |
| `Ctrl + I` | Kursiivi |
| `Ctrl + U` | Alleviivattu |
| `Ctrl + F` | Etsi ja Korvaa |
| `Del` | Tyhjennä solun sisältö |

**Monivalinta:** Vedä hiirellä tai `Shift + Napsauta`.

**Täyttökahva:** Vedä solun oikeassa alakulmassa olevaa sinistä neliötä kopioidaksesi arvoja tai kaavoja.

### 5.2 Kaavarivi

```
┌─────────┬────┬───────────────────────────────────────────┐
│   A1    │ fx │  =SUMMA(A1:A10)                           │
└─────────┴────┴───────────────────────────────────────────┘
  ↑          ↑              ↑
  Solun osoite  Symboli        Syöttökenttä (näyttää raakakaavan)
```

- **Solun osoite**: Näyttää aktiivisen solun tai valitun alueen (esim. `A1:B5`)
- **Symboli fx**: Ilmaisee kaavan syötön
- **Syöttökenttä**: Näyttää aina raakakaavan – ei tulosta

**Virheen näyttäminen:** Kaavavirheiden kuten `#VIRHE`, `#VIIT!`, `#JAKO/0!` jne. yhteydessä kenttä merkitään punaisella kehyksellä ja virhe näkyy oikealla.

### 5.3 Kaavojen Syöttäminen

Kaavan syöttö alkaa aina `=`-merkillä:

```
=SUMMA(A1:A10)             Summa
=KESKIARVO(B1:B5)          Keskiarvo
=MAKS(C1:C100)             Maksimi
=MIN(D1:D50)               Minimi
=LASKE(A:A)                Laskenta
=JOS(A1>0;"Kyllä";"Ei")    Ehto
=PHAKU(...)                Pystysuora haku
=PYÖRISTÄ(A1; 2)           Pyöristäminen
```

#### Kaavaviittaukset Hiiren Napsautuksella

1. Kirjoita `=` tai funktio kuten `=SUMMA(`
2. Napsauta haluttua solua → Osoite lisätään
3. Vedä alueille → Alue lisätään (esim. `A1:B10`)

### 5.4 Kaavat Arkkien Välillä

Viittaukset muihin arkkeihin – aivan kuten Excelissä:

```
=Arkki2!A1                      Yksittäinen solu Arkki2:sta
=SUMMA(Arkki2!A1:B10)           Summa Arkki2:sta
=Arkki1!A1 + Arkki2!B5          Yhdistelmä useista arkeista
=KESKIARVO(Myynti!C1:C100)      Alue "Myynti"-arkista
```

**Hiiren napsautuksella:**
1. Kirjoita `=` soluun
2. Napsauta toista arkkivälilehteä → Lisää `Arkki2!`
3. Napsauta haluttua solua → Lisää `A1`

### 5.5 Lukumuodot

Työkalurivin **123-symbolin** kautta:

| Muoto | Esimerkki | Kuvaus |
|-------|---------|--------|
| Vakio | 1234.5 | Ei muotoilua |
| Luku | 1 234,56 | Muoto 2 desimaalilla |
| Valuutta | 1 234,56 € | Valuuttamuoto |
| Prosentti | 12,5% | Arvo × 100 %-merkillä |
| Tuhannet | 1 234 | Kokonaisluvut tuhaterottimella |
| Päivämäärä | 24.02.2026 | Päivämäärämuoto |

### 5.6 Solujen Yhdistäminen

1. Valitse solualue
2. **Lisää → Yhdistä solut**
3. Vain vasemman yläsolun arvo säilytetään

**Erota:** **Lisää → Erota solut**

### 5.7 Ehdollinen Muotoilu

1. Valitse alue
2. **Muokkaa → Ehdollinen muotoilu...**
3. Valitse sääntö: Suurempi kuin / Pienempi kuin / Yhtä suuri kuin / Välillä / Teksti sisältää
4. Valitse teksti- ja taustavärit
5. **Lisää**

**Poista:** Valitse alue → **Muokkaa → Poista ehdollinen muotoilu**

### 5.8 Kiinnitä Ruudut

1. Valitse solu, josta vierittäminen alkaa
2. **Näytä → Kiinnitä ruudut**
3. Kaikki yläpuolella olevat rivit ja vasemmalla olevat sarakkeet kiinnitetään

**Vapauta kiinnitys:** **Näytä → Vapauta ruutujen kiinnitys**

### 5.9 Kommentit

1. Valitse solu → **Lisää → Lisää kommentti** → Kirjoita teksti → OK
2. Kommenteilla varustetut solut näyttävät **punaisen kolmion** oikeassa yläkulmassa

### 5.10 Etsi ja Korvaa

`Ctrl + F` tai **Muokkaa → Etsi ja Korvaa**:
- **Etsi**: Navigointi ◀ ▶
- **Korvaa**: Yksitellen tai kaikki kerralla

### 5.11 Rivien ja Sarakkeiden Lisääminen/Poistaminen

**Lisää**-valikon kautta: Lisää rivi yllä/alla, sarake vasemmalle/oikealle, poista rivi/sarake.

### 5.12 Tilarivi

Alareunassa näytetään automaattisesti tilastot monivalinnalle:

```
Σ Summa: 12 345   ⌀ Kesk.: 1 234   ↓ Min: 100   ↑ Maks: 5 000   Lkm: 10
```

### 5.13 Tuonti / Vienti

| Toiminto | Muoto | Kuvaus |
|----------|-------|--------|
| Tuo | `.xlsx`, `.xlsm` | Avaa Excel-tiedostoja |
| CSV-tuonti | `.csv` | Pilkku-/puolipisteerotetut tiedostot |
| Vie | `.xlsx` | Tallenna Excel-tiedostona |
| CSV-vienti | `.csv` | Tallenna CSV-muodossa (UTF-8, puolipiste) |
| Tulosta / PDF | — | Tulostuksen esikatselu, vain täytetyt rivit |
| Lisää kuva | PNG, JPG | Upota kuva laskentataulukkoon |

### 5.14 Tekoälytoiminnot

#### Tekoälyn Kaavageneraattori
Napsauta **✨** kaavarivin vieressä:
> "Laske sarakkeen B kaikkien positiivisten arvojen keskiarvo"
> → `=KESKIARVO.JOS(B:B;">0")`

#### Tekoälyn Taulukkoavustaja
> "Luo kuukausittainen myyntitaulukko vuodelle 2025 sarakkeilla: Kuukausi, Tuotot, Kulut, Voitto"

### 5.15 Pikanäppäinten Yhteenveto

| Pikakuvake | Toiminto |
|-----------|----------|
| `Ctrl + Z` | Kumoa |
| `Ctrl + Y` | Tee uudelleen |
| `Ctrl + C` | Kopioi |
| `Ctrl + V` | Liitä |
| `Ctrl + X` | Leikkaa |
| `Ctrl + B` | Lihavoitu |
| `Ctrl + I` | Kursiivi |
| `Ctrl + U` | Alleviivattu |
| `Ctrl + F` | Etsi ja Korvaa |
| `F2` | Muokkaa solua |
| `Enter` | Vahvista + alas |
| `Tab` | Vahvista + oikealle |
| `Escape` | Peruuta |
| `Del` | Tyhjennä sisältö |
| `Shift + Napsauta` | Laajenna valintaa |

---

## 6. SEPShow – Esitykset

SEPShow on **Konva**-alustalle (canvas-renderöijä) rakennettu diaesityseditori.

### 6.1 Käyttöliittymä

| Alue | Kuvaus |
|------|--------|
| **Vasen sivupaneeli** | Dialuettelo – esikatselu, muuta järjestystä vetämällä |
| **Pääalue** | Aktiivisen dian canvas-editori |
| **Työkalurivi** | Työkalut, vienti, esitystila |
| **Esittäjän muistiinpanot** | Nykyisen dian muistiinpanot |

### 6.2 Esitystila

Napsauta **Esitä** koko näytön esitystä varten:
- Navigointi: nuolinäppäimet `→` / `←` tai napsauttaminen
- `Esc` lopettaa esitystilan

---

## 7. Eliot – AI-avustaja

Eliot on sisäänrakennettu tekoälyavustaja, joka on käytettävissä kaikissa kolmessa sovelluksessa.

### 7.1 Chat-widget

**Kelluva Eliot-symboli** sijaitsee kaikissa sovelluksissa oikeassa alakulmassa.

#### Tilanilmaisimet

| Symboli | Tila |
|---------|------|
| 💬 (normaali) | Tekoäly valmis |
| ⏳ (pyörivä) | Tekoäly latautuu |
| ❌ (punainen) | Virhe tai ei yhteyttä |

---

## 8. Asetukset

### Tekoälyasetukset
| Vaihtoehto | Kuvaus |
|------------|--------|
| **API-URL** | Tekoälyn taustapalvelun URL (oletus: `http://localhost:8080`) |
| **API-avain** | Valinnainen, ulkoisille tekoäly-API:lle |
| **Testaa yhteys** | Tarkistaa, onko tekoälypalvelu tavoitettavissa |

### Kieli
SEPOffice tukee **29 kieltä**. Kieli voidaan valita asetusvalintaikkunassa.

---

## 9. Pikanäppäimet

### Globaalit

| Pikakuvake | Toiminto |
|-----------|----------|
| `Ctrl + Z` | Kumoa |
| `Ctrl + Y` | Tee uudelleen |
| `Ctrl + S` | Tallenna |

### SEPGrid

| Pikakuvake | Toiminto |
|-----------|----------|
| `Enter` | Vahvista solu, alas |
| `Tab` | Vahvista solu, oikealle |
| `Escape` | Peruuta muokkaus |
| `Ctrl + C` | Kopioi |
| `Ctrl + V` | Liitä |
| `F2` | Muokkaa solua |
| Nuolinäppäimet | Navigoi soluissa |

---

## Tekniset Huomiot

- **Tietojen tallentaminen:** Kaikki asiakirjat tallennetaan paikallisesti selainmuistiin. Tietoja ei lähetetä ulkoisille palvelimille.
- **Tekoälymalli:** Qwen2.5-0.5B toimii täysin paikallisesti – tekoälytoiminnot eivät vaadi internet-yhteyttä.
- **Järjestelmävaatimukset:** Windows 10/11, vähintään 4 GB RAM (8 GB suositeltu tekoälymallille)

---

*SEPOffice v1.0.1 · Simon Erich Plath · SEP Interactive · 2026*
