# SEPOffice – User Manual

**Version 1.0.1 · Simon Erich Plath · © 2026 SEP Interactive**

---

## Table of Contents

1. [Overview](#1-overview)
2. [Installation & Startup](#2-installation--startup)
3. [Dashboard](#3-dashboard)
4. [SEPWrite – Word Processing](#4-sepwrite--word-processing)
5. [SEPGrid – Spreadsheet](#5-sepgrid--spreadsheet)
6. [SEPShow – Presentations](#6-sepshow--presentations)
7. [Eliot – AI Assistant](#7-eliot--ai-assistant)
8. [Settings](#8-settings)
9. [Keyboard Shortcuts](#9-keyboard-shortcuts)

---

## 1. Overview

SEPOffice is an AI-powered desktop office suite for Windows, consisting of three integrated applications:

| App | Function |
|-----|----------|
| **SEPWrite** | Create rich-text documents, Word/PDF export |
| **SEPGrid** | Spreadsheet with formulas and charts |
| **SEPShow** | Presentations with canvas editor |

All three apps are connected to **Eliot** – an embedded AI assistant that formulates texts, generates formulas, and designs slides.

---

## 2. Installation & Startup

### Installer
Run `SEPOffice Setup 1.0.1.exe`. The wizard guides you through the installation:
- Installation directory selectable (default: `Program Files\SEPOffice`)
- Start menu entry is created
- Optional desktop shortcut

### Direct Start (without Installer)
Run `release\win-unpacked\SEPOffice.exe`.

### First Start
On first start, the AI service loads the language model (Qwen2.5-0.5B) in the background. The loading progress is visible in the Eliot chat widget at the bottom right. Depending on hardware, this takes **1–5 minutes**.

> **Note:** The app is immediately usable – Eliot becomes active once the loading bar reaches 100%.

---

## 3. Dashboard

![Dashboard](assets/screenshots/01_dashboard.png)

The Dashboard is SEPOffice's start page. It shows:

### Three App Tiles
- **SEPWrite** – Create or open document
- **SEPGrid** – Create or open spreadsheet  
- **SEPShow** – Create or open presentation *(NEW)*

Click on a tile → New empty document in the respective app.

### Recently Opened Documents
Below the tiles, recently edited documents appear with type icon, name, and last modification date. Click on an entry to open the document directly.

### Navigation
The top navigation bar is available in all apps:

| Element | Function |
|---------|----------|
| **SEPWrite / SEPGrid / SEPShow** (Buttons) | Switch between apps |
| ⚙️ | Open settings |
| ⌨️ | Show keyboard shortcuts |
| 🌙 / ☀️ | Toggle dark/light mode |

---

## 4. SEPWrite – Word Processing

![SEPWrite Editor](assets/screenshots/02_sepwrite.png)

SEPWrite is a modern rich-text editor based on **TipTap**.

### 4.1 Formatting

The toolbar offers the following formatting options:

| Symbol | Function | Keyboard Shortcut |
|--------|----------|-------------------|
| **B** | Bold | `Ctrl + B` |
| *I* | Italic | `Ctrl + I` |
| <u>U</u> | Underlined | `Ctrl + U` |
| H1 | Heading 1 | — |
| H2 | Heading 2 | — |
| List | Bullet list | — |
| 1. List | Numbered list | — |

### 4.2 Inserting Images

Via **Insert → Image** the image insertion dialog opens:
- Upload image via drag & drop or file selection
- Alignment: Left, Center, Right
- Images are embedded directly in the document

### 4.3 Saving & Exporting Documents

| Action | Description |
|--------|-------------|
| **Save** | Automatic saving in local browser storage |
| **Export as .docx** | Download Word-compatible document |
| **Print / PDF** | Print preview with page setup, then print or save as PDF |

### 4.4 AI Support

The Eliot chat (→ [Chapter 7](#7-eliot--ai-assistant)) is fully integrated in SEPWrite. Text drafts, revisions, and rephrasing can be requested directly in the chat.

---

## 5. SEPGrid – Spreadsheet

![SEPGrid](assets/screenshots/03_sepgrid.png)

SEPGrid is a powerful spreadsheet with **10,000 rows × 26 columns** per worksheet – comparable to Microsoft Excel and OpenOffice Calc.

### 5.1 Basic Operations

| Action | Description |
|--------|-------------|
| Click cell | Select cell |
| Double-click / F2 | Edit cell |
| `Enter` | Confirm, move to next row |
| `Tab` | Confirm, move to next column |
| `Escape` | Cancel editing |
| `Ctrl + Z` | Undo |
| `Ctrl + Y` | Redo |
| `Ctrl + C` | Copy |
| `Ctrl + V` | Paste |
| `Ctrl + X` | Cut |
| `Ctrl + B` | Bold |
| `Ctrl + I` | Italic |
| `Ctrl + U` | Underlined |
| `Ctrl + F` | Find & Replace |
| `Delete` | Clear cell content |

**Multiple Selection:** Drag mouse with left button pressed or `Shift + Click`.

**Fill Handle:** Drag the blue square at the bottom right of a cell to copy values or formulas.

### 5.2 The Formula Bar

The formula bar is located below the ribbon toolbar:

```
┌─────────┬────┬───────────────────────────────────────────┐
│   A1    │ fx │  =SUM(A1:A10)                             │
└─────────┴────┴───────────────────────────────────────────┘
  ↑          ↑              ↑
  Cell address  Formula symbol  Input field (shows raw formula)
```

- **Cell Address**: Shows the active cell or selected range (e.g., `A1:B5`)
- **fx Symbol**: Indicates formula input
- **Input Field**: Always shows the raw formula (e.g., `=SUM(A1:A10)`) – not the result

**Error Display:** For formula errors like `#ERROR`, `#REF!`, `#DIV/0!` etc., the input field gets a red border and the error type is shown on the right.

### 5.3 Entering Formulas

Formula input always begins with `=`:

```
=SUM(A1:A10)           Sum
=AVERAGE(B1:B5)        Average
=MAX(C1:C100)          Maximum
=MIN(D1:D50)           Minimum
=COUNT(A:A)            Count
=IF(A1>0,"Yes","No")   Condition
=VLOOKUP(...)          Lookup
=ROUND(A1, 2)          Round
```

#### Formula References via Mouse Click

Instead of typing cell addresses manually:

1. Type `=` or a function like `=SUM(`
2. Click on the desired cell → Address is inserted
3. Drag for ranges → Range is inserted (e.g., `A1:B10`)

This works after `=`, `(`, `+`, `-`, `*`, `/`, `,` and `!`.

#### Formula Quick Access

Click on the **calculator symbol (fx)** to open formula suggestions:
- SUM(), AVERAGE(), MAX(), MIN(), COUNT(), IF()
- When a range is selected, it is automatically inserted

### 5.4 Cross-Sheet Formulas

References to other worksheets – just like in Excel:

```
=Sheet2!A1                    Single cell from Sheet2
=SUM(Sheet2!A1:B10)           Sum from Sheet2
=Sheet1!A1 + Sheet2!B5        Combination of multiple sheets
=AVERAGE(Sales!C1:C100)       Range from sheet "Sales"
```

**Via Mouse Click:**
1. Type `=` in a cell
2. Click on another sheet tab → `Sheet2!` is inserted
3. Click on the desired cell → `A1` is added

### 5.5 Number Formats

Via the **123 symbol** in the toolbar:

| Format | Example | Description |
|--------|---------|-------------|
| Standard | 1234.5 | No formatting |
| Number | 1,234.56 | Standard notation with 2 decimals |
| Currency | $1,234.56 | Currency format |
| Percent | 12.5% | Value × 100 with % sign |
| Thousands | 1,234 | Whole numbers with thousands separator |
| Date | 02/24/2026 | Date format |

### 5.6 Merge Cells

Combine multiple cells into one:

1. Select cell range
2. **Insert → Merge Cells**
3. Only the value of the top-left cell is retained

**Unmerge:** Same menu position or **Insert → Unmerge Cells**

### 5.7 Conditional Formatting

Automatically format cells based on values:

1. Select range
2. **Edit → Conditional Formatting...**
3. Choose rule:
   - Greater than / Less than
   - Equal to
   - Between (two values)
   - Text contains
4. Choose colors for text and background
5. **Add**

*Example:* Highlight all values over 1000 in green.

**Remove:** Select range → **Edit → Remove Conditional Formatting**

### 5.8 Freeze Panes

Keep row or column headers visible while scrolling:

1. Select the cell from which scrolling should start
2. **View → Freeze Panes**
3. All rows above and columns to the left of the selection are frozen

**Unfreeze:** **View → Unfreeze Panes**

### 5.9 Comments

Add notes to cells:

1. Select cell
2. **Insert → Add Comment**
3. Enter text → OK

Cells with comments show a **red triangle** in the upper right corner. Tooltip appears on hover.

### 5.10 Find & Replace

`Ctrl + F` or **Edit → Find & Replace**:

- **Find**: Enter text, navigate through matches with ◀ ▶
- **Replace**: Replace one at a time or all at once

### 5.11 Insert/Delete Rows and Columns

**Via the Insert menu:**
- Insert row above/below
- Insert column left/right
- Delete row/column

The position is based on the current selection.

### 5.12 Status Bar

At the bottom, statistics are automatically displayed for multiple selections:

```
Σ Sum: 12,345   ⌀ Average: 1,234   ↓ Min: 100   ↑ Max: 5,000   Count: 10
```

### 5.13 Import / Export

| Function | Format | Description |
|----------|--------|-------------|
| Import | `.xlsx`, `.xlsm` | Open Excel files |
| CSV Import | `.csv` | Comma/semicolon-separated files |
| Export | `.xlsx` | Save as Excel file |
| CSV Export | `.csv` | Save as CSV file (UTF-8, semicolon) |
| Print / PDF | — | Print preview, only filled rows |
| Insert Image | PNG, JPG | Embed image in spreadsheet area |

### 5.14 AI Functions

#### AI Formula Generator
Click on **✨** at the formula bar:
> "Calculate the average of all positive values in column B"  
> → `=AVERAGEIF(B:B,">0")`

#### AI Table Assistant
Glassmorphism overlay when clicking the AI button:
> "Create a monthly sales table for 2025 with columns: Month, Revenue, Costs, Profit"

#### Vibe Writing
Activate via **File → Enable Vibe Writing**: AI support while typing.

### 5.15 Keyboard Shortcuts Overview

| Shortcut | Function |
|----------|----------|
| `Ctrl + Z` | Undo |
| `Ctrl + Y` | Redo |
| `Ctrl + C` | Copy |
| `Ctrl + V` | Paste |
| `Ctrl + X` | Cut |
| `Ctrl + B` | Bold |
| `Ctrl + I` | Italic |
| `Ctrl + U` | Underlined |
| `Ctrl + F` | Find & Replace |
| `F2` | Edit cell |
| `Enter` | Confirm + move down |
| `Tab` | Confirm + move right |
| `Escape` | Cancel |
| `Delete` | Clear content |
| `Shift + Click` | Extend range |

---

## 6. SEPShow – Presentations

![SEPShow](assets/screenshots/04_sepshow.png)

SEPShow is a slide-based presentation editor based on **Konva** (canvas renderer).

### 6.1 Interface

| Area | Description |
|------|-------------|
| **Left Sidebar** | Slide list – preview of all slides, reorder via drag & drop |
| **Main Area** | Canvas editor of the active slide |
| **Toolbar (top)** | Tools, export, presentation mode |
| **Speaker Notes (bottom)** | Notes for the current slide |

### 6.2 Insert Elements

Via the toolbar:

| Action | Description |
|--------|-------------|
| **Text** | Place text field on the slide |
| **Image** | Insert image via upload or clipboard |
| **Shape** | Rectangles, circles, etc. |
| **AI Layout** | AI generates a complete slide layout |

All elements can:
- Be freely moved with the mouse
- Be resized (corner handles)
- Be rotated

### 6.3 Slide Management

| Action | Description |
|--------|-------------|
| **+** in the sidebar | Add new slide |
| Right-click on slide | Duplicate, delete, move |
| Drag & Drop in sidebar | Change order |

### 6.4 Presentation Mode

Click on **Present** (screen icon) to open full-screen presentation:
- Navigation: `→` / `←` arrow keys or click
- `Esc` exits presentation mode

### 6.5 Speaker Notes

Below the canvas is a notes field for each slide. Notes are only visible in the editor, not during the presentation.

### 6.6 Export

| Format | Description |
|--------|-------------|
| Save | In local storage (automatic) |
| PDF/Print | Export slides as PDF |

---

## 7. Eliot – AI Assistant

![Eliot Chat](assets/screenshots/05_eliot.png)

Eliot is the embedded AI assistant available in all three apps.

### 7.1 The Chat Widget

The **floating Eliot symbol** is located at the bottom right in all apps. Click on it to open the chat window.

#### Status Indicators

| Symbol | Status |
|--------|--------|
| 💬 (normal) | AI ready – type a request |
| ⏳ (spinning) | AI loading – model is initializing |
| ❌ (red) | Error or not connected |

#### Loading Progress
On first start, a **loading bar** (0–100%) appears while the language model is being loaded into memory.

### 7.2 Working with Eliot

Type a request in the chat input field and confirm with `Enter` or the send button.

**Example requests:**

*In SEPWrite:*
- "Write a professional introduction for a report on renewable energy"
- "Revise this text to be more formal"
- "Summarize the following text in 3 sentences"

*In SEPGrid:*
- "What formula calculates the moving average over 5 values?"
- "Create a formula that finds the highest value in column C"

*In SEPShow:*
- "Create a slide about climate change with 3 bullet points"
- "Suggest a color scheme for a business presentation"

### 7.3 Ghost Text (Auto-Completion)

In SEPWrite, Eliot offers **Ghost Text** – a faint gray text preview while you type. `Tab` accepts the suggestion.

### 7.4 Start AI Service (manually)

If the AI service doesn't start automatically, a **"Start AI Service"** button appears in the Eliot widget. Click to start the service manually.

---

## 8. Settings

The Settings window (⚙️ in the navigation bar) contains:

### AI Settings
| Option | Description |
|--------|-------------|
| **API URL** | URL of the AI backend (default: `http://localhost:8080`) |
| **API Key** | Optional, for external AI APIs |
| **Test Connection** | Checks if the AI service is reachable |

### Language
SEPOffice supports **29 languages**. The language can be selected in the Settings dialog and applies to the entire user interface.

---

## 9. Keyboard Shortcuts

The Help window (⌨️ in the navigation bar) shows all keyboard shortcuts.

### Global

| Shortcut | Function |
|----------|----------|
| `Ctrl + Z` | Undo |
| `Ctrl + Y` | Redo |
| `Ctrl + S` | Save |

### SEPWrite

| Shortcut | Function |
|----------|----------|
| `Ctrl + B` | Bold |
| `Ctrl + I` | Italic |
| `Ctrl + U` | Underlined |
| `Ctrl + P` | Print |

### SEPGrid

| Shortcut | Function |
|----------|----------|
| `Enter` | Confirm cell, move down |
| `Tab` | Confirm cell, move right |
| `Escape` | Cancel editing |
| `Ctrl + C` | Copy |
| `Ctrl + V` | Paste |
| `F2` | Edit cell |
| Arrow keys | Navigate cells |
| `Shift + Arrow keys` | Multiple selection |

### SEPShow

| Shortcut | Function |
|----------|----------|
| `→` / `←` | Next / Previous slide (presentation mode) |
| `Esc` | Exit presentation mode |
| `Ctrl + D` | Duplicate slide |
| `Delete` | Delete selected element |

---

## Technical Notes

- **Data Storage:** All documents are saved locally in browser storage (`localStorage`). No data is transmitted to external servers.
- **AI Model:** Qwen2.5-0.5B runs completely locally – no internet connection required for AI functions.
- **System Requirements:** Windows 10/11, min. 4 GB RAM (8 GB recommended for the AI model)
- **Uninstallation:** Via Windows "Apps & Features" → Uninstall SEPOffice

---

*SEPOffice v1.0.1 · Simon Erich Plath · SEP Interactive · 2026*
