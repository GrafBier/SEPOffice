# SEPOffice – Podręcznik Użytkownika

**Wersja 1.0.1 · Simon Erich Plath · © 2026 SEP Interactive**

---

## Spis Treści

1. [Przegląd](#1-przegląd)
2. [Instalacja i Uruchamianie](#2-instalacja-i-uruchamianie)
3. [Panel Główny](#3-panel-główny)
4. [SEPWrite – Edytor Tekstu](#4-sepwrite--edytor-tekstu)
5. [SEPGrid – Arkusz Kalkulacyjny](#5-sepgrid--arkusz-kalkulacyjny)
6. [SEPShow – Prezentacje](#6-sepshow--prezentacje)
7. [Eliot – Asystent AI](#7-eliot--asystent-ai)
8. [Ustawienia](#8-ustawienia)
9. [Skróty Klawiszowe](#9-skróty-klawiszowe)

---

## 1. Przegląd

SEPOffice to desktopowy pakiet biurowy wspomagany przez AI dla systemu Windows, składający się z trzech zintegrowanych aplikacji:

| Aplikacja | Funkcja |
|-----------|---------|
| **SEPWrite** | Tworzenie dokumentów rich-text, eksport do Word/PDF |
| **SEPGrid** | Arkusz kalkulacyjny z formułami i wykresami |
| **SEPShow** | Prezentacje z edytorem na płótnie |

Wszystkie trzy aplikacje są połączone z **Eliotem** – wbudowanym asystentem AI, który redaguje teksty, generuje formuły i projektuje slajdy.

---

## 2. Instalacja i Uruchamianie

### Instalator
Uruchom `SEPOffice Setup 1.0.1.exe`. Kreator przeprowadzi przez instalację:
- Możliwość wyboru folderu instalacyjnego (domyślnie: `Program Files\SEPOffice`)
- Tworzy wpis w menu Start
- Opcjonalny skrót na pulpicie

### Uruchomienie Bezpośrednie (bez instalacji)
Uruchom `release\win-unpacked\SEPOffice.exe`.

### Pierwsze Uruchomienie
Przy pierwszym uruchomieniu usługa AI ładuje model językowy (Qwen2.5-0.5B) w tle. Postęp jest widoczny w widgecie czatu Eliota w prawym dolnym rogu. W zależności od sprzętu trwa to **1–5 minut**.

> **Uwaga:** Aplikacja jest od razu użyteczna – Eliot staje się aktywny, gdy pasek postępu osiągnie 100%.

---

## 3. Panel Główny

Panel główny jest stroną startową SEPOffice.

### Trzy Kafelki Aplikacji
- **SEPWrite** – Tworzenie lub otwieranie dokumentu
- **SEPGrid** – Tworzenie lub otwieranie arkusza
- **SEPShow** – Tworzenie lub otwieranie prezentacji

### Ostatnie Dokumenty
Pod kafelkami wyświetlają się ostatnio edytowane dokumenty z ikoną typu, nazwą i datą ostatniej modyfikacji.

### Nawigacja

| Element | Funkcja |
|---------|---------|
| **SEPWrite / SEPGrid / SEPShow** | Przełączanie między aplikacjami |
| ⚙️ | Otwieranie ustawień |
| ⌨️ | Wyświetlanie skrótów klawiszowych |
| 🌙 / ☀️ | Przełączanie trybu ciemnego/jasnego |

---

## 4. SEPWrite – Edytor Tekstu

SEPWrite to nowoczesny edytor rich-text oparty na **TipTap**.

### 4.1 Formatowanie

| Symbol | Funkcja | Skrót |
|--------|---------|-------|
| **Gr** | Pogrubienie | `Ctrl + B` |
| *K* | Kursywa | `Ctrl + I` |
| <u>P</u> | Podkreślenie | `Ctrl + U` |
| N1 | Nagłówek 1 | — |
| N2 | Nagłówek 2 | — |

### 4.2 Wstawianie Obrazów
Przez **Wstaw → Obraz**: przesyłanie przez przeciągnięcie lub wybór pliku.

### 4.3 Zapisywanie i Eksportowanie

| Akcja | Opis |
|-------|------|
| **Zapisz** | Automatyczny zapis w lokalnym magazynie przeglądarki |
| **Eksportuj jako .docx** | Pobierz dokument kompatybilny z Wordem |
| **Drukuj / PDF** | Podgląd wydruku, następnie drukowanie lub zapis jako PDF |

---

## 5. SEPGrid – Arkusz Kalkulacyjny

SEPGrid to zaawansowany arkusz kalkulacyjny z **10.000 wierszy × 26 kolumn** na arkusz – podobny do Microsoft Excel i OpenOffice Calc.

### 5.1 Podstawowa Obsługa

| Akcja | Opis |
|-------|------|
| Kliknięcie komórki | Zaznaczenie komórki |
| Dwukliknięcie / F2 | Edycja komórki |
| `Enter` | Zatwierdź, przejdź do następnego wiersza |
| `Tab` | Zatwierdź, przejdź do następnej kolumny |
| `Escape` | Anuluj edycję |
| `Ctrl + Z` | Cofnij |
| `Ctrl + Y` | Ponów |
| `Ctrl + C` | Kopiuj |
| `Ctrl + V` | Wklej |
| `Ctrl + X` | Wytnij |
| `Ctrl + B` | Pogrubienie |
| `Ctrl + I` | Kursywa |
| `Ctrl + U` | Podkreślenie |
| `Ctrl + F` | Znajdź i Zamień |
| `Del` | Wyczyść zawartość komórki |

**Zaznaczanie wielu komórek:** Przeciągnij myszą lub `Shift + Kliknięcie`.

**Uchwyt wypełnienia:** Przeciągnij niebieski kwadracik w prawym dolnym rogu komórki, aby skopiować wartości lub formuły.

### 5.2 Pasek Formuły

```
┌─────────┬────┬───────────────────────────────────────────┐
│   A1    │ fx │  =SUMA(A1:A10)                            │
└─────────┴────┴───────────────────────────────────────────┘
  ↑          ↑              ↑
  Adres kom.  Symbol         Pole wejściowe (wyświetla surową formułę)
```

- **Adres komórki**: Pokazuje aktywną komórkę lub zaznaczony zakres (np. `A1:B5`)
- **Symbol fx**: Sygnalizuje wprowadzanie formuły
- **Pole wejściowe**: Zawsze pokazuje surową formułę – nie wynik

**Wyświetlanie błędów:** Przy błędach formuły takich jak `#BŁĄD`, `#ADR!`, `#DZIEL/0!` itp. pole jest obramowane na czerwono, a błąd wyświetlany po prawej stronie.

### 5.3 Wprowadzanie Formuł

Wprowadzanie formuły zawsze zaczyna się od `=`:

```
=SUMA(A1:A10)              Suma
=ŚREDNIA(B1:B5)            Średnia
=MAKS(C1:C100)             Maksimum
=MIN(D1:D50)               Minimum
=LICZ.JEŻELI(A:A;">0")     Liczenie warunkowe
=JEŻELI(A1>0;"Tak";"Nie")  Warunek
=WYSZUKAJ.PIONOWO(...)     Wyszukiwanie pionowe
=ZAOKR(A1; 2)              Zaokrąglanie
```

#### Odwołania do Formuł przez Kliknięcie Myszą

1. Wpisz `=` lub funkcję jak `=SUMA(`
2. Kliknij żądaną komórkę → Adres zostanie wstawiony
3. Przeciągnij dla zakresów → Zakres zostanie wstawiony (np. `A1:B10`)

### 5.4 Formuły Między Arkuszami

Odwołania do innych arkuszy – tak jak w Excelu:

```
=Arkusz2!A1                         Pojedyncza komórka z Arkuszu2
=SUMA(Arkusz2!A1:B10)               Suma z Arkuszu2
=Arkusz1!A1 + Arkusz2!B5            Kombinacja wielu arkuszy
=ŚREDNIA(Sprzedaż!C1:C100)          Zakres z arkusza "Sprzedaż"
```

**Przez kliknięcie myszą:**
1. Wpisz `=` w komórce
2. Kliknij na inną zakładkę arkusza → Wstawia `Arkusz2!`
3. Kliknij żądaną komórkę → Dołącza `A1`

### 5.5 Formaty Liczb

Przez symbol **123** w pasku narzędzi:

| Format | Przykład | Opis |
|--------|---------|------|
| Standardowy | 1234.5 | Bez formatowania |
| Liczba | 1 234,56 | Format z 2 miejscami dziesiętnymi |
| Waluta | 1 234,56 zł | Format walutowy |
| Procent | 12,5% | Wartość × 100 ze znakiem % |
| Tysiące | 1 234 | Liczby całkowite z separatorem tysięcy |
| Data | 24.02.2026 | Format daty |

### 5.6 Scalanie Komórek

1. Zaznacz zakres komórek
2. **Wstaw → Scal komórki**
3. Zachowana zostaje tylko wartość lewej górnej komórki

**Rozdzielanie:** **Wstaw → Rozdziel komórki**

### 5.7 Formatowanie Warunkowe

1. Zaznacz zakres
2. **Edycja → Formatowanie warunkowe...**
3. Wybierz regułę: Większe niż / Mniejsze niż / Równe / Między / Tekst zawiera
4. Wybierz kolory tekstu i tła
5. **Dodaj**

**Usuwanie:** Zaznacz zakres → **Edycja → Usuń formatowanie warunkowe**

### 5.8 Blokowanie Okienek

1. Zaznacz komórkę, od której ma być przewijanie
2. **Widok → Blokuj okienka**
3. Wszystkie wiersze powyżej i kolumny po lewej zostaną zablokowane

**Odblokowanie:** **Widok → Odblokuj okienka**

### 5.9 Komentarze

1. Zaznacz komórkę → **Wstaw → Dodaj komentarz** → Wpisz tekst → OK
2. Komórki z komentarzami pokazują **czerwony trójkąt** w prawym górnym rogu

### 5.10 Znajdź i Zamień

`Ctrl + F` lub **Edycja → Znajdź i Zamień**:
- **Znajdź**: Nawigowanie ◀ ▶
- **Zamień**: Pojedynczo lub wszystkie na raz

### 5.11 Wstawianie/Usuwanie Wierszy i Kolumn

Przez menu **Wstaw**: Wstaw wiersz powyżej/poniżej, kolumnę po lewej/prawej, usuń wiersz/kolumnę.

### 5.12 Pasek Stanu

Na dole automatycznie wyświetlane są statystyki dla zaznaczenia wielu komórek:

```
Σ Suma: 12 345   ⌀ Śr.: 1 234   ↓ Min: 100   ↑ Maks: 5 000   Liczba: 10
```

### 5.13 Importowanie / Eksportowanie

| Funkcja | Format | Opis |
|---------|--------|------|
| Import | `.xlsx`, `.xlsm` | Otwieranie plików Excel |
| Import CSV | `.csv` | Pliki oddzielone przecinkiem/średnikiem |
| Eksport | `.xlsx` | Zapis jako plik Excel |
| Eksport CSV | `.csv` | Zapis jako CSV (UTF-8, średnik) |
| Drukuj / PDF | — | Podgląd wydruku, tylko wypełnione wiersze |
| Wstaw obraz | PNG, JPG | Osadzanie obrazu w arkuszu |

### 5.14 Funkcje AI

#### Generator Formuł AI
Kliknij **✨** przy pasku formuły:
> "Oblicz średnią wszystkich dodatnich wartości w kolumnie B"
> → `=ŚREDNIA.JEŻELI(B:B;">0")`

#### Asystent Tabel AI
> "Utwórz miesięczną tabelę sprzedaży za 2025 z kolumnami: Miesiąc, Przychód, Koszty, Zysk"

### 5.15 Przegląd Skrótów Klawiszowych

| Skrót | Funkcja |
|-------|---------|
| `Ctrl + Z` | Cofnij |
| `Ctrl + Y` | Ponów |
| `Ctrl + C` | Kopiuj |
| `Ctrl + V` | Wklej |
| `Ctrl + X` | Wytnij |
| `Ctrl + B` | Pogrubienie |
| `Ctrl + I` | Kursywa |
| `Ctrl + U` | Podkreślenie |
| `Ctrl + F` | Znajdź i Zamień |
| `F2` | Edytuj komórkę |
| `Enter` | Zatwierdź + w dół |
| `Tab` | Zatwierdź + w prawo |
| `Escape` | Anuluj |
| `Del` | Wyczyść zawartość |
| `Shift + Klik` | Rozszerz zaznaczenie |

---

## 6. SEPShow – Prezentacje

SEPShow to edytor prezentacji slajdowych oparty na **Konva** (renderer canvas).

### 6.1 Interfejs

| Obszar | Opis |
|--------|------|
| **Lewy panel boczny** | Lista slajdów – podgląd, zmiana kolejności przez przeciąganie |
| **Główny obszar** | Edytor canvas aktywnego slajdu |
| **Pasek narzędzi** | Narzędzia, eksport, tryb prezentacji |
| **Notatki prelegenta** | Notatki do bieżącego slajdu |

### 6.2 Tryb Prezentacji

Kliknij **Prezentuj** dla prezentacji na pełnym ekranie:
- Nawigacja: klawisze strzałek `→` / `←` lub kliknięcie
- `Esc` kończy tryb prezentacji

---

## 7. Eliot – Asystent AI

Eliot to wbudowany asystent AI dostępny we wszystkich trzech aplikacjach.

### 7.1 Widget Czatu

**Pływający symbol Eliota** znajduje się w prawym dolnym rogu wszystkich aplikacji.

#### Wskaźniki Stanu

| Symbol | Stan |
|--------|------|
| 💬 (normalny) | AI gotowy |
| ⏳ (obracający się) | Ładowanie AI |
| ❌ (czerwony) | Błąd lub brak połączenia |

---

## 8. Ustawienia

### Ustawienia AI
| Opcja | Opis |
|-------|------|
| **URL API** | URL backendu AI (domyślnie: `http://localhost:8080`) |
| **Klucz API** | Opcjonalny, dla zewnętrznych API AI |
| **Test połączenia** | Sprawdza czy usługa AI jest dostępna |

### Język
SEPOffice obsługuje **29 języków**. Język można wybrać w oknie dialogowym ustawień.

---

## 9. Skróty Klawiszowe

### Globalne

| Skrót | Funkcja |
|-------|---------|
| `Ctrl + Z` | Cofnij |
| `Ctrl + Y` | Ponów |
| `Ctrl + S` | Zapisz |

### SEPGrid

| Skrót | Funkcja |
|-------|---------|
| `Enter` | Zatwierdź komórkę, w dół |
| `Tab` | Zatwierdź komórkę, w prawo |
| `Escape` | Anuluj edycję |
| `Ctrl + C` | Kopiuj |
| `Ctrl + V` | Wklej |
| `F2` | Edytuj komórkę |
| Klawisze strzałek | Nawigacja po komórkach |

---

## Uwagi Techniczne

- **Przechowywanie danych:** Wszystkie dokumenty są przechowywane lokalnie w magazynie przeglądarki. Żadne dane nie są wysyłane na zewnętrzne serwery.
- **Model AI:** Qwen2.5-0.5B działa całkowicie lokalnie – dla funkcji AI nie jest wymagane połączenie z internetem.
- **Wymagania systemowe:** Windows 10/11, min. 4 GB RAM (8 GB zalecane dla modelu AI)

---

*SEPOffice v1.0.1 · Simon Erich Plath · SEP Interactive · 2026*
