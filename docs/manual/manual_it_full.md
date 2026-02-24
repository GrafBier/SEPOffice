# SEPOffice – Manuale Utente

**Versione 1.0.1 · Simon Erich Plath · © 2026 SEP Interactive**

---

## Indice

1. [Panoramica](#1-panoramica)
2. [Installazione e Avvio](#2-installazione-e-avvio)
3. [Dashboard](#3-dashboard)
4. [SEPWrite – Elaborazione Testi](#4-sepwrite--elaborazione-testi)
5. [SEPGrid – Foglio di Calcolo](#5-sepgrid--foglio-di-calcolo)
6. [SEPShow – Presentazioni](#6-sepshow--presentazioni)
7. [Eliot – Assistente AI](#7-eliot--assistente-ai)
8. [Impostazioni](#8-impostazioni)
9. [Scorciatoie da Tastiera](#9-scorciatoie-da-tastiera)

---

## 1. Panoramica

SEPOffice è una suite da ufficio desktop basata su AI per Windows, composta da tre applicazioni integrate:

| App | Funzione |
|-----|----------|
| **SEPWrite** | Crea documenti rich-text, esporta in Word/PDF |
| **SEPGrid** | Foglio di calcolo con formule e grafici |
| **SEPShow** | Presentazioni con editor canvas |

Tutte e tre le app sono collegate a **Eliot** – un assistente AI integrato che formula testi, genera formule e progetta diapositive.

---

## 2. Installazione e Avvio

### Programma di Installazione
Esegui `SEPOffice Setup 1.0.1.exe`. La procedura guidata ti accompagna nell'installazione:
- Directory di installazione selezionabile (predefinita: `Programmi\SEPOffice`)
- Voce nel menu Start creata
- Collegamento sul desktop opzionale

### Avvio Diretto (senza Programma di Installazione)
Esegui `release\win-unpacked\SEPOffice.exe`.

### Primo Avvio
Al primo avvio, il servizio AI carica il modello linguistico (Qwen2.5-0.5B) in background. L'avanzamento del caricamento è visibile nel widget chat Eliot in basso a destra. A seconda dell'hardware, questo richiede **1–5 minuti**.

> **Nota:** L'app è immediatamente utilizzabile – Eliot diventa attivo quando la barra di caricamento raggiunge il 100%.

---

## 3. Dashboard

La Dashboard è la pagina iniziale di SEPOffice.

### Tre Riquadri App
- **SEPWrite** – Crea o apri documento
- **SEPGrid** – Crea o apri foglio di calcolo
- **SEPShow** – Crea o apri presentazione

### Documenti Recenti
Sotto i riquadri appaiono i documenti modificati di recente con icona tipo, nome e data ultima modifica.

### Navigazione

| Elemento | Funzione |
|----------|----------|
| **SEPWrite / SEPGrid / SEPShow** | Passare tra le app |
| ⚙️ | Aprire impostazioni |
| ⌨️ | Mostrare scorciatoie da tastiera |
| 🌙 / ☀️ | Alternare modalità scura/chiara |

---

## 4. SEPWrite – Elaborazione Testi

SEPWrite è un editor rich-text moderno basato su **TipTap**.

### 4.1 Formattazione

| Simbolo | Funzione | Scorciatoia |
|---------|----------|-------------|
| **G** | Grassetto | `Ctrl + B` |
| *C* | Corsivo | `Ctrl + I` |
| <u>S</u> | Sottolineato | `Ctrl + U` |
| T1 | Titolo 1 | — |
| T2 | Titolo 2 | — |

### 4.2 Inserimento Immagini
Tramite **Inserisci → Immagine**: carica tramite drag & drop o selezione file.

### 4.3 Salvataggio ed Esportazione

| Azione | Descrizione |
|--------|-------------|
| **Salva** | Salvataggio automatico nel browser locale |
| **Esporta come .docx** | Scarica documento compatibile con Word |
| **Stampa / PDF** | Anteprima di stampa, poi stampa o salva come PDF |

---

## 5. SEPGrid – Foglio di Calcolo

SEPGrid è un potente foglio di calcolo con **10.000 righe × 26 colonne** per foglio di lavoro – paragonabile a Microsoft Excel e OpenOffice Calc.

### 5.1 Operazioni di Base

| Azione | Descrizione |
|--------|-------------|
| Clic su cella | Seleziona cella |
| Doppio clic / F2 | Modifica cella |
| `Invio` | Conferma, passa alla riga successiva |
| `Tab` | Conferma, passa alla colonna successiva |
| `Escape` | Annulla modifica |
| `Ctrl + Z` | Annulla |
| `Ctrl + Y` | Ripeti |
| `Ctrl + C` | Copia |
| `Ctrl + V` | Incolla |
| `Ctrl + X` | Taglia |
| `Ctrl + B` | Grassetto |
| `Ctrl + I` | Corsivo |
| `Ctrl + U` | Sottolineato |
| `Ctrl + F` | Trova e Sostituisci |
| `Canc` | Cancella contenuto cella |

**Selezione multipla:** Trascina il mouse tenendo premuto il tasto sinistro o `Shift + Clic`.

**Quadratino di riempimento:** Trascina il quadrato blu in basso a destra di una cella per copiare valori o formule.

### 5.2 La Barra della Formula

```
┌─────────┬────┬───────────────────────────────────────────┐
│   A1    │ fx │  =SOMMA(A1:A10)                           │
└─────────┴────┴───────────────────────────────────────────┘
  ↑          ↑              ↑
  Indirizzo   Simbolo        Campo di input (mostra formula grezza)
```

- **Indirizzo cella**: Mostra la cella attiva o l'intervallo selezionato (es. `A1:B5`)
- **Simbolo fx**: Indica l'input della formula
- **Campo di input**: Mostra sempre la formula grezza – non il risultato

**Visualizzazione errori:** Per errori come `#ERRORE`, `#RIF!`, `#DIV/0!` ecc., il campo diventa rosso e l'errore viene mostrato a destra.

### 5.3 Inserimento Formule

L'input della formula inizia sempre con `=`:

```
=SOMMA(A1:A10)           Somma
=MEDIA(B1:B5)            Media
=MAX(C1:C100)            Massimo
=MIN(D1:D50)             Minimo
=CONTA(A:A)              Conteggio
=SE(A1>0,"Sì","No")      Condizione
=CERCA.VERT(...)         Ricerca verticale
=ARROTONDA(A1, 2)        Arrotondamento
```

#### Riferimenti Formula tramite Clic del Mouse

1. Digita `=` o una funzione come `=SOMMA(`
2. Clic sulla cella desiderata → L'indirizzo viene inserito
3. Trascina per gli intervalli → L'intervallo viene inserito (es. `A1:B10`)

Funziona dopo `=`, `(`, `+`, `-`, `*`, `/`, `,` e `!`.

### 5.4 Formule tra Fogli

Riferimenti ad altri fogli di lavoro – come in Excel:

```
=Foglio2!A1                      Singola cella da Foglio2
=SOMMA(Foglio2!A1:B10)           Somma da Foglio2
=Foglio1!A1 + Foglio2!B5         Combinazione di più fogli
=MEDIA(Vendite!C1:C100)          Intervallo da foglio "Vendite"
```

**Tramite clic del mouse:**
1. Digita `=` in una cella
2. Clic su un'altra scheda foglio → `Foglio2!` viene inserito
3. Clic sulla cella desiderata → `A1` viene aggiunto

### 5.5 Formati Numerici

Tramite il simbolo **123** nella barra degli strumenti:

| Formato | Esempio | Descrizione |
|---------|---------|-------------|
| Standard | 1234.5 | Nessuna formattazione |
| Numero | 1.234,56 | Notazione con 2 decimali |
| Valuta | € 1.234,56 | Formato valuta |
| Percentuale | 12,5% | Valore × 100 con simbolo % |
| Migliaia | 1.234 | Numeri interi con separatore migliaia |
| Data | 24/02/2026 | Formato data |

### 5.6 Unione Celle

1. Seleziona l'intervallo di celle
2. **Inserisci → Unisci Celle**
3. Solo il valore della cella in alto a sinistra viene mantenuto

**Separa:** **Inserisci → Separa Celle**

### 5.7 Formattazione Condizionale

1. Seleziona l'intervallo
2. **Modifica → Formattazione Condizionale...**
3. Scegli regola: Maggiore di / Minore di / Uguale a / Tra / Il testo contiene
4. Scegli colori per testo e sfondo
5. **Aggiungi**

**Rimuovi:** Seleziona intervallo → **Modifica → Rimuovi Formattazione Condizionale**

### 5.8 Blocca Riquadri

1. Seleziona la cella da cui inizia lo scorrimento
2. **Visualizza → Blocca Riquadri**
3. Tutte le righe sopra e le colonne a sinistra vengono bloccate

**Sblocca:** **Visualizza → Sblocca Riquadri**

### 5.9 Commenti

1. Seleziona cella → **Inserisci → Aggiungi Commento** → Inserisci testo → OK
2. Le celle con commenti mostrano un **triangolo rosso** in alto a destra

### 5.10 Trova e Sostituisci

`Ctrl + F` o **Modifica → Trova e Sostituisci**:
- **Trova**: Naviga con ◀ ▶
- **Sostituisci**: Singolarmente o tutti in una volta

### 5.11 Inserisci/Elimina Righe e Colonne

Tramite il menu **Inserisci**: Inserisci riga sopra/sotto, colonna sinistra/destra, elimina riga/colonna.

### 5.12 Barra di Stato

In basso vengono visualizzate automaticamente statistiche per selezioni multiple:

```
Σ Somma: 12.345   ⌀ Media: 1.234   ↓ Min: 100   ↑ Max: 5.000   Conteggio: 10
```

### 5.13 Importa / Esporta

| Funzione | Formato | Descrizione |
|----------|---------|-------------|
| Importa | `.xlsx`, `.xlsm` | Apri file Excel |
| Importa CSV | `.csv` | File separati da virgola/punto e virgola |
| Esporta | `.xlsx` | Salva come file Excel |
| Esporta CSV | `.csv` | Salva come CSV (UTF-8, punto e virgola) |
| Stampa / PDF | — | Anteprima di stampa, solo righe compilate |
| Inserisci Immagine | PNG, JPG | Incorpora immagine nel foglio |

### 5.14 Funzioni AI

#### Generatore di Formule AI
Clic su **✨** nella barra della formula:
> "Calcola la media di tutti i valori positivi nella colonna B"
> → `=MEDIA.SE(B:B,">0")`

#### Assistente Tabelle AI
> "Crea una tabella vendite mensili per il 2025 con colonne: Mese, Ricavi, Costi, Profitto"

#### Scrittura Vibe
Attivabile tramite **File → Attiva Scrittura Vibe**: supporto AI durante la digitazione.

### 5.15 Riepilogo Scorciatoie da Tastiera

| Scorciatoia | Funzione |
|-------------|----------|
| `Ctrl + Z` | Annulla |
| `Ctrl + Y` | Ripeti |
| `Ctrl + C` | Copia |
| `Ctrl + V` | Incolla |
| `Ctrl + X` | Taglia |
| `Ctrl + B` | Grassetto |
| `Ctrl + I` | Corsivo |
| `Ctrl + U` | Sottolineato |
| `Ctrl + F` | Trova e Sostituisci |
| `F2` | Modifica cella |
| `Invio` | Conferma + scendi |
| `Tab` | Conferma + vai a destra |
| `Escape` | Annulla |
| `Canc` | Cancella contenuto |
| `Shift + Clic` | Estendi selezione |

---

## 6. SEPShow – Presentazioni

SEPShow è un editor di presentazioni a diapositive basato su **Konva** (renderer canvas).

### 6.1 Interfaccia

| Area | Descrizione |
|------|-------------|
| **Barra laterale sinistra** | Elenco diapositive – anteprima, riordina tramite drag & drop |
| **Area principale** | Editor canvas della diapositiva attiva |
| **Barra degli strumenti** | Strumenti, esportazione, modalità presentazione |
| **Note del presentatore** | Note per la diapositiva corrente |

### 6.2 Inserisci Elementi

| Azione | Descrizione |
|--------|-------------|
| **Testo** | Posiziona campo testo sulla diapositiva |
| **Immagine** | Inserisci immagine tramite caricamento |
| **Forma** | Rettangoli, cerchi, ecc. |
| **Layout AI** | L'AI genera un layout completo per la diapositiva |

### 6.3 Gestione Diapositive

| Azione | Descrizione |
|--------|-------------|
| **+** nella barra laterale | Aggiungi nuova diapositiva |
| Clic destro sulla diapositiva | Duplica, elimina, sposta |
| Drag & Drop nella barra laterale | Cambia ordine |

### 6.4 Modalità Presentazione

Clic su **Presenta** per aprire la presentazione a schermo intero:
- Navigazione: tasti freccia `→` / `←` o clic
- `Esc` esce dalla modalità presentazione

### 6.5 Esporta

| Formato | Descrizione |
|---------|-------------|
| Salva | Nella memoria locale (automatico) |
| PDF/Stampa | Esporta diapositive come PDF |

---

## 7. Eliot – Assistente AI

Eliot è l'assistente AI integrato disponibile in tutte e tre le app.

### 7.1 Il Widget Chat

Il **simbolo Eliot flottante** si trova in basso a destra in tutte le app.

#### Indicatori di Stato

| Simbolo | Stato |
|---------|-------|
| 💬 (normale) | AI pronta |
| ⏳ (rotante) | AI in caricamento |
| ❌ (rosso) | Errore o non connessa |

### 7.2 Lavorare con Eliot

**Esempi di richieste:**

*In SEPWrite:*
- "Scrivi un'introduzione professionale per un rapporto sulle energie rinnovabili"
- "Riassumi questo testo in 3 frasi"

*In SEPGrid:*
- "Quale formula calcola la media mobile su 5 valori?"
- "Crea una formula che somma solo i valori positivi"

### 7.3 Testo Fantasma (Completamento Automatico)

In SEPWrite, Eliot offre il **Testo Fantasma** – anteprima di testo grigio mentre digiti. `Tab` accetta il suggerimento.

---

## 8. Impostazioni

La finestra Impostazioni (⚙️ nella barra di navigazione) contiene:

### Impostazioni AI
| Opzione | Descrizione |
|---------|-------------|
| **URL API** | URL del backend AI (predefinito: `http://localhost:8080`) |
| **Chiave API** | Opzionale, per API AI esterne |
| **Testa Connessione** | Verifica se il servizio AI è raggiungibile |

### Lingua
SEPOffice supporta **29 lingue**. La lingua può essere selezionata nella finestra di dialogo Impostazioni.

---

## 9. Scorciatoie da Tastiera

### Globale

| Scorciatoia | Funzione |
|-------------|----------|
| `Ctrl + Z` | Annulla |
| `Ctrl + Y` | Ripeti |
| `Ctrl + S` | Salva |

### SEPWrite

| Scorciatoia | Funzione |
|-------------|----------|
| `Ctrl + B` | Grassetto |
| `Ctrl + I` | Corsivo |
| `Ctrl + U` | Sottolineato |
| `Ctrl + P` | Stampa |

### SEPGrid

| Scorciatoia | Funzione |
|-------------|----------|
| `Invio` | Conferma cella, scendi |
| `Tab` | Conferma cella, vai a destra |
| `Escape` | Annulla modifica |
| `Ctrl + C` | Copia |
| `Ctrl + V` | Incolla |
| `F2` | Modifica cella |
| Tasti freccia | Naviga celle |
| `Shift + Tasti freccia` | Selezione multipla |

### SEPShow

| Scorciatoia | Funzione |
|-------------|----------|
| `→` / `←` | Prossima / Precedente diapositiva |
| `Esc` | Esci dalla modalità presentazione |
| `Ctrl + D` | Duplica diapositiva |
| `Canc` | Elimina elemento selezionato |

---

## Note Tecniche

- **Archiviazione dati:** Tutti i documenti vengono salvati localmente nel browser storage. Nessun dato viene trasmesso a server esterni.
- **Modello AI:** Qwen2.5-0.5B funziona completamente in locale – nessuna connessione internet richiesta per le funzioni AI.
- **Requisiti di sistema:** Windows 10/11, min. 4 GB RAM (8 GB consigliati per il modello AI)

---

*SEPOffice v1.0.1 · Simon Erich Plath · SEP Interactive · 2026*
