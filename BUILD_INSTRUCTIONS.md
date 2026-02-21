# SEPOffice Build-Anleitung (Executable)

Dieses Projekt ist vorbereitet, um als Desktop-App für Windows, Linux und macOS gebaut zu werden.

## Voraussetzungen
1.  **Node.js** (installiert)
2.  **Python** (installiert für den AI-Service)
3.  **PyInstaller** (`pip install pyinstaller`)

## Schritt 1: Frontend & API Build
Führe im Hauptverzeichnis aus:
```bash
npm run desktop:build
```
Dies baut das Vite-Frontend und startet `electron-builder`.

## Schritt 2: AI-Service als Sidecar (Wichtig für Executables)
Da Python nicht nativ in Electron läuft, muss der AI-Service als eigenständiges Binary gebaut werden:

1. Gehe in `services/ai`
2. Erstelle das Binary:
   ```bash
   pyinstaller --onefile main.py
   ```
3. Kopiere die entstandene `main.exe` (Windows) oder `main` (Linux/macOS) in den `release` Ordner oder binde sie als Sidecar in `package.json` ein.

## Schritt 3: Multi-Plattform Builds
Um für alle Plattformen gleichzeitig zu bauen (mit GitHub Actions oder lokal):
```bash
npx electron-builder -wml
```
*   `-w`: Windows
*   `-m`: macOS
*   `-l`: Linux

## Hinweise zu den Services
Im `electron-main.js` wurde die Struktur vorbereitet, um die API und den AI-Service zu starten. In der finalen Version sollten diese Dienste als Unterprozesse (Child Processes) von Electron gestartet werden, damit sie beim Schließen der App ebenfalls beendet werden.
