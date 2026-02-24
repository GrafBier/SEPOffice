import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Parser } from "hot-formula-parser";
import { useAISettings } from "../contexts/AISettingsContext";
import * as ai from "../services/aiService";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { FixedSizeList } from "react-window";
import * as XLSX from "xlsx";
import {
  Upload,
  Download,
  Sparkles,
  Bold as BoldIcon,
  Italic as ItalicIcon,
  Underline as UnderlineIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Sigma,
  SortAsc,
  Calculator,
  Grid3X3,
  Palette,
  Type,
  Printer,
  X,
  Undo2,
  Redo2
} from "lucide-react";

import { EliotChat } from "./EliotChat";
import { PrintPreviewModal } from "./PrintPreviewModal";
import { ImageUploadModal } from "./ImageUploadModal";
import type { ImageDataPayload } from "./ImageUploadModal";
import { useReactToPrint } from "react-to-print";
import { persistenceService } from "../services/persistenceService";
import { useTranslation } from "react-i18next";

interface CellStyle {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  align?: "left" | "center" | "right";
  color?: string;
  bgColor?: string;
  borders?: {
    top?: boolean;
    right?: boolean;
    bottom?: boolean;
    left?: boolean;
  };
  autoColor?: boolean;
  numberFormat?: "general" | "number" | "currency" | "percent" | "date" | "thousand";
  comment?: string; // Cell comment/note
}

// Merged cell definition
interface MergedCell {
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
}

// Conditional formatting rule
interface ConditionalRule {
  id: string;
  range: string; // e.g. "A1:B10"
  type: "greaterThan" | "lessThan" | "equals" | "between" | "text" | "duplicate" | "top10";
  value1?: string | number;
  value2?: string | number; // for "between"
  style: Partial<CellStyle>;
}

interface ParserCellCoord {
  row: { index: number };
  column: { index: number };
  label?: string;
}

type ParserDoneCallback = (value: string | number | (string | number)[][]) => void;

const MAX_IMPORT_FILE_SIZE = 6 * 1024 * 1024;
const MAX_IMPORT_ROWS = 2600;
const MAX_IMPORT_COLS = 300;
const MAX_CELL_TEXT_LENGTH = 2048;
const ALLOWED_IMPORT_EXTENSIONS = [".xlsx", ".xlsm"];

type ScanResult = {
  fatal?: string;
  warnings: string[];
};

const scanWorksheetForRisks = (ws?: XLSX.WorkSheet): ScanResult => {
  if (!ws) return { warnings: [] };

  const ref = ws["!ref"];
  if (!ref) {
    return { warnings: ["Das Arbeitsblatt ist leer."] };
  }

  const range = XLSX.utils.decode_range(ref);
  const rowCount = range.e.r - range.s.r + 1;
  const colCount = range.e.c - range.s.c + 1;
  if (rowCount > MAX_IMPORT_ROWS) {
    return {
      fatal: `Arbeitsblatt enthält ${rowCount} Zeilen (max. ${MAX_IMPORT_ROWS}). Bitte passe die Datei an.`,
      warnings: [],
    };
  }
  if (colCount > MAX_IMPORT_COLS) {
    return {
      fatal: `Arbeitsblatt enthält ${colCount} Spalten (max. ${MAX_IMPORT_COLS}). Bitte passe die Datei an.`,
      warnings: [],
    };
  }

  const warnings: string[] = [];
  let formulaCount = 0;
  let largeCellCount = 0;

  Object.keys(ws).forEach((cellRef) => {
    if (cellRef.startsWith("!")) return;
    const cell = ws[cellRef] as XLSX.CellObject | undefined;
    if (cell?.f) {
      formulaCount += 1;
      if (formulaCount === 1) {
        warnings.push("Formeln wurden erkannt und werden als Werte übernommen.");
      }
    }
    const value = cell?.v;
    if (typeof value === "string" && value.length > MAX_CELL_TEXT_LENGTH) {
      largeCellCount += 1;
      if (largeCellCount === 1) {
        warnings.push("Einige Zellen enthalten sehr lange Texte und wurden gekürzt.");
      }
    }
  });

  return { warnings };
};

/*
  English developer notes:

  - This grid component is intentionally optimized for large sheet sizes by
    defaulting to a large virtualized dataset and using `react-window` for
    rendering. The design tradeoff: we avoid loading full DOM for all rows
    to keep responsiveness, but the data model uses dense arrays which is
    simpler to reason about.

  - Difficulty encountered: formula parsing and imports may contain many
    edge-cases. We sanitize imported values and scan for risks (very large
    sheets / very long cell contents / formulas) and present warnings to the
    user rather than attempting fragile automated conversions.

  - The `applyAutoFill` logic below intentionally copies selection data and
    handles both single-cell fills and pattern fills. This logic was the
    trickiest to get right with respect to indices and wrap behavior; we
    kept it local and explicit (no external library) for maintainability.
*/

const sanitizeImportedValue = (value: unknown): string => {
  if (value === undefined || value === null) return "";
  if (typeof value === "number") return value.toString();
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > MAX_CELL_TEXT_LENGTH
      ? trimmed.slice(0, MAX_CELL_TEXT_LENGTH)
      : trimmed;
  }
  if (value instanceof Date) return value.toISOString();
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

/** Format a cell value for display based on its numberFormat. */
const formatCellValue = (value: string | number, format?: CellStyle["numberFormat"]): string => {
  if (value === "" || value === undefined || value === null) return "";
  if (!format || format === "general") return String(value);

  const num = typeof value === "number" ? value : parseFloat(String(value));
  if (isNaN(num)) return String(value); // Non-numeric → show as-is

  switch (format) {
    case "number":
      return num.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    case "currency":
      return num.toLocaleString("de-DE", { style: "currency", currency: "EUR" });
    case "percent":
      return (num * 100).toLocaleString("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + " %";
    case "date": {
      // Try to interpret as Excel serial date or ISO date
      const d = new Date(num > 25569 ? (num - 25569) * 86400000 : num);
      if (!isNaN(d.getTime())) return d.toLocaleDateString("de-DE");
      return String(value);
    }
    case "thousand":
      return num.toLocaleString("de-DE", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    default:
      return String(value);
  }
};

interface Sheet {
  id: string;
  name: string;
  rows: number;
  cols: number;
  data: string[][];
  cellStyles: Record<string, CellStyle>;
  colWidths: number[];
  rowHeights: number[];
  images?: { id: string; src: string; x: number; y: number; width: number; height: number; caption?: string }[];
  mergedCells?: MergedCell[];
  conditionalRules?: ConditionalRule[];
  frozenRows?: number; // Number of frozen rows at top
  frozenCols?: number; // Number of frozen columns at left
}

export default function SepGrid({ docId }: { docId?: string | null }) {
  const { t } = useTranslation();
  const [currentDocId, setCurrentDocId] = useState<string | null>(docId || null);
  const [docName, setDocName] = useState("Unbenannte Tabelle");

  // Sync docId from props (Roadmap A1)
  useEffect(() => {
    if (docId && docId !== currentDocId) {
      setCurrentDocId(docId);
    }
  }, [docId, currentDocId]);

  const [sheets, setSheets] = useState<Sheet[]>([
    {
      id: "sheet-1",
      name: "Tabelle1",
      rows: 10000,
      cols: 26,
      data: Array.from({ length: 10000 }, () => Array(26).fill("")),
      cellStyles: {},
      colWidths: Array(26).fill(100),
      rowHeights: Array(10000).fill(30),
      images: [],
    }
  ]);
  const [activeSheetIndex, setActiveSheetIndex] = useState(0);
  const currentSheet = sheets[activeSheetIndex];
  const { rows, cols, data, cellStyles, colWidths, rowHeights } = currentSheet;
  const persistenceSnapshotRef = useRef({ docName, sheets });
  useEffect(() => {
    persistenceSnapshotRef.current = { docName, sheets };
  }, [docName, sheets]);

  // ── Undo / Redo ─────────────────────────────────────────────────────
  const undoStackRef = useRef<{ data: string[][]; cellStyles: Record<string, CellStyle> }[]>([]);
  const redoStackRef = useRef<{ data: string[][]; cellStyles: Record<string, CellStyle> }[]>([]);
  const MAX_HISTORY = 50;

  const pushUndoSnapshot = useCallback(() => {
    undoStackRef.current.push({
      data: currentSheet.data.map(r => [...r]),
      cellStyles: { ...currentSheet.cellStyles },
    });
    if (undoStackRef.current.length > MAX_HISTORY) undoStackRef.current.shift();
    redoStackRef.current = [];
  }, [currentSheet]);

  const handleUndo = useCallback(() => {
    const snap = undoStackRef.current.pop();
    if (!snap) return;
    redoStackRef.current.push({
      data: currentSheet.data.map(r => [...r]),
      cellStyles: { ...currentSheet.cellStyles },
    });
    setSheets(prev => prev.map((s, i) => i === activeSheetIndex ? { ...s, data: snap.data, cellStyles: snap.cellStyles } : s));
  }, [activeSheetIndex, currentSheet]);

  const handleRedo = useCallback(() => {
    const snap = redoStackRef.current.pop();
    if (!snap) return;
    undoStackRef.current.push({
      data: currentSheet.data.map(r => [...r]),
      cellStyles: { ...currentSheet.cellStyles },
    });
    setSheets(prev => prev.map((s, i) => i === activeSheetIndex ? { ...s, data: snap.data, cellStyles: snap.cellStyles } : s));
  }, [activeSheetIndex, currentSheet]);

  const updateCurrentSheet = useCallback((updates: Partial<Sheet>) => {
    if (updates.data || updates.cellStyles) pushUndoSnapshot();
    setSheets((prev) =>
      prev.map((s, i) => (i === activeSheetIndex ? { ...s, ...updates } : s)),
    );
  }, [activeSheetIndex, pushUndoSnapshot]);

  const [saveStatus, setSaveStatus] = useState("All changes saved");
  const [selection, setSelection] = useState<{
    start: { r: number; c: number } | null;
    end: { r: number; c: number } | null;
  }>({ start: null, end: null });
  const [isDragging, setIsDragging] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [sortConfig, setSortConfig] = useState<{
    col: number;
    direction: "asc" | "desc";
  } | null>(null);
  const [nlpQuery, setNlpQuery] = useState("");
  const [isGeneratingFormula, setIsGeneratingFormula] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [aiPromptOpen, setAiPromptOpen] = useState(false);
  const [aiPromptContext, setAiPromptContext] = useState("");
  const [aiPromptInput, setAiPromptInput] = useState("");
  const [isPromptingAI, setIsPromptingAI] = useState(false);
  const [resizing, setResizing] = useState<{
    type: "col" | "row";
    index: number;
    startPos: number;
    startSize: number;
  } | null>(null);
  const [isFilling, setIsFilling] = useState(false);
  const [fillEnd, setFillEnd] = useState<{ r: number; c: number } | null>(null);
  const [ctrlPressed, setCtrlPressed] = useState(false);
  const [clipboard, setClipboard] = useState<{
    data: string[][],
    start: { r: number, c: number }
  } | null>(null);
  const [formulaInput, setFormulaInput] = useState("");
  const [aiGenerateOpen, setAiGenerateOpen] = useState(false);
  const [aiGeneratePrompt, setAiGeneratePrompt] = useState("");
  const [isGeneratingTable, setIsGeneratingTable] = useState(false);
  const [showFormulaSuggestions, setShowFormulaSuggestions] = useState(false);
  const [isEditingFormula, setIsEditingFormula] = useState(false);
  const [formulaDragStart, setFormulaDragStart] = useState<{ r: number; c: number } | null>(null);
  const [formulaDragging, setFormulaDragging] = useState(false);
  const [formulaOriginSheet, setFormulaOriginSheet] = useState<{ sheetIndex: number; r: number; c: number } | null>(null);
  const [sheetContextMenu, setSheetContextMenu] = useState<{ x: number; y: number; index: number } | null>(null);
  const gridScrollRef = useRef<HTMLDivElement>(null);

  // Find & Replace state
  const [findReplaceOpen, setFindReplaceOpen] = useState(false);
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [findResults, setFindResults] = useState<{ r: number; c: number }[]>([]);
  const [findIndex, setFindIndex] = useState(0);

  // Conditional Formatting Dialog state
  const [condFormatOpen, setCondFormatOpen] = useState(false);
  const [condFormatType, setCondFormatType] = useState<ConditionalRule["type"]>("greaterThan");
  const [condFormatValue1, setCondFormatValue1] = useState("");
  const [condFormatValue2, setCondFormatValue2] = useState("");
  const [condFormatColor, setCondFormatColor] = useState("#22c55e");
  const [condFormatBgColor, setCondFormatBgColor] = useState("#134e2e");

  // Number format state (now in CellStyle.numberFormat, this is kept for backward compat migration only)

  // Refs to avoid stale closures in global mousemove
  const isDraggingRef = useRef(false);
  const isDraggingHeaderRef = useRef<"col" | "row" | null>(null);
  const selectionRef = useRef(selection);
  const isFillingRef = useRef(false);
  const fillEndRef = useRef(fillEnd);

  const printRef = useRef<HTMLDivElement>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [draggingImageId, setDraggingImageId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handlePrintOuter = useReactToPrint({
    contentRef: printRef,
    documentTitle: "SEPGrid-Document",
  });

  const handleImageInsert = (data: ImageDataPayload) => {
    const newImage = {
      id: `img-${Date.now()}`,
      src: data.src,
      x: 100,
      y: 100,
      width: 300,
      height: 200,
      caption: data.caption
    };
    updateCurrentSheet({ images: [...(currentSheet.images || []), newImage] });
  };

  const handleImageMouseDown = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    const img = currentSheet.images?.find(i => i.id === id);
    if (img) {
      setDraggingImageId(id);
      setDragOffset({ x: e.clientX - img.x, y: e.clientY - img.y });
    }
  };

  const applyAutoFill = useCallback(() => {
    if (!selection.start || !selection.end || !fillEnd) return;

    const minR = Math.min(selection.start.r, selection.end.r);
    const maxR = Math.max(selection.start.r, selection.end.r);
    const minC = Math.min(selection.start.c, selection.end.c);
    const maxC = Math.max(selection.start.c, selection.end.c);

    const fillMinR = Math.min(minR, fillEnd.r);
    const fillMaxR = Math.max(maxR, fillEnd.r);
    const fillMinC = Math.min(minC, fillEnd.c);
    const fillMaxC = Math.max(maxC, fillEnd.c);

    // Keep copy-on-write semantics to avoid mutating the shared data array
    // directly. This preserves React state invariants and makes undo/redo
    // snapshots reliable.
    const newData = [...data];

    const selectionData: string[] = [];
    for (let r = minR; r <= maxR; r++) {
      for (let c = minC; c <= maxC; c++) {
        selectionData.push(data[r][c]);
      }
    }

    const isSingleCell = selectionData.length === 1;
    const baseVal = selectionData[0];
    const isNum = !isNaN(Number(baseVal)) && baseVal !== "";

    for (let r = fillMinR; r <= fillMaxR; r++) {
      for (let c = fillMinC; c <= fillMaxC; c++) {
        if (r >= minR && r <= maxR && c >= minC && c <= maxC) continue;

        if (isSingleCell) {
          if (isNum && !ctrlPressed) {
            const offset = (r - minR) + (c - minC);
            newData[r][c] = (Number(baseVal) + offset).toString();
          } else {
            newData[r][c] = baseVal;
          }
        } else {
          const patternIndexR = (r - minR) % (maxR - minR + 1);
          const patternIndexC = (c - minC) % (maxC - minC + 1);
          newData[r][c] = data[minR + patternIndexR][minC + patternIndexC];
        }
      }
    }

    updateCurrentSheet({ data: newData });
    setSelection((prev) => {
      if (!prev.start || !prev.end) return prev;
      return { start: prev.start, end: { r: fillEnd.r, c: fillEnd.c } };
    });
    setFillEnd(null);
    isFillingRef.current = false;
  }, [selection, fillEnd, data, ctrlPressed, updateCurrentSheet]);

  const handleCellChange = useCallback((r: number, c: number, value: string) => {
    const newData = [...data];
    newData[r] = [...newData[r]];
    newData[r][c] = value;
    updateCurrentSheet({ data: newData });
  }, [data, updateCurrentSheet]);

  const { settings: aiSettings } = useAISettings();

  const saveTimeoutRef = useRef<number | null>(null);
  const importFileInputRef = useRef<HTMLInputElement>(null);
  const openFileInputRef = useRef<HTMLInputElement>(null);
  const csvImportRef = useRef<HTMLInputElement>(null);

  // Listen to Ctrl key and Copy/Paste/Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Undo / Redo (works globally)
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        handleRedo();
        return;
      }

      // Find & Replace (Ctrl+F / Ctrl+H) – works even when editing
      if ((e.ctrlKey || e.metaKey) && (e.key === 'f' || e.key === 'h')) {
        e.preventDefault();
        setFindReplaceOpen(true);
        return;
      }

      // Do not intercept if user is actively typing in an input/textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        isEditingFormula
      ) {
        // If Enter is pressed inside a cell input, just blur it to finish editing
        if (e.key === "Enter" && target.tagName === "INPUT" && target.id.startsWith("cell-input-")) {
          target.blur();
        }
        return;
      }

      if (e.key === "Control") setCtrlPressed(true);

      // Ctrl+B / Ctrl+I / Ctrl+U – Formatting shortcuts
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        applyStyle({ bold: true });
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
        e.preventDefault();
        applyStyle({ italic: true });
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
        e.preventDefault();
        applyStyle({ underline: true });
        return;
      }

      // Ctrl+X – Cut
      if ((e.ctrlKey || e.metaKey) && e.key === 'x' && selection.start && selection.end && !isEditingFormula) {
        e.preventDefault();
        const minR = Math.min(selection.start.r, selection.end.r);
        const maxR = Math.max(selection.start.r, selection.end.r);
        const minC = Math.min(selection.start.c, selection.end.c);
        const maxC = Math.max(selection.start.c, selection.end.c);

        const clipData: string[][] = [];
        for (let r = minR; r <= maxR; r++) {
          const rowData = [];
          for (let c = minC; c <= maxC; c++) {
            rowData.push(data[r]?.[c] || "");
          }
          clipData.push(rowData);
        }
        setClipboard({ data: clipData, start: { r: minR, c: minC } });

        // Clear original cells
        const newData = [...data];
        for (let r = minR; r <= maxR; r++) {
          newData[r] = [...(newData[r] || [])];
          for (let c = minC; c <= maxC; c++) {
            newData[r][c] = "";
          }
        }
        updateCurrentSheet({ data: newData });
        setSaveStatus(`Cut ${maxR - minR + 1}×${maxC - minC + 1} cells`);
        return;
      }

      // Ctrl+V – Paste (internal clipboard, or system clipboard as fallback)
      if ((e.ctrlKey || e.metaKey) && e.key === 'v' && selection.start && !isEditingFormula) {
        e.preventDefault();
        if (clipboard) {
          // Internal paste
          const startR = selection.start.r;
          const startC = selection.start.c;
          const newData = data.map(row => [...row]);
          for (let r = 0; r < clipboard.data.length; r++) {
            for (let c = 0; c < clipboard.data[r].length; c++) {
              const tR = startR + r;
              const tC = startC + c;
              if (tR < rows && tC < cols) {
                newData[tR][tC] = clipboard.data[r][c];
              }
            }
          }
          updateCurrentSheet({ data: newData });
          setSaveStatus(`Pasted ${clipboard.data.length}×${clipboard.data[0]?.length || 0} cells`);
        } else {
          // Try system clipboard
          navigator.clipboard.readText().then(text => {
            if (!text || !selection.start) return;
            const pasteRows = text.split('\n').map(line => line.split('\t'));
            const startR = selection.start.r;
            const startC = selection.start.c;
            const newData = data.map(row => [...row]);
            for (let r = 0; r < pasteRows.length; r++) {
              for (let c = 0; c < pasteRows[r].length; c++) {
                const tR = startR + r;
                const tC = startC + c;
                if (tR < rows && tC < cols) {
                  newData[tR][tC] = pasteRows[r][c];
                }
              }
            }
            updateCurrentSheet({ data: newData });
            setSaveStatus(`Pasted from clipboard`);
          }).catch(() => { /* clipboard API not available */ });
        }
        return;
      }

      // F2 – Edit active cell
      if (e.key === "F2" && selection.start) {
        e.preventDefault();
        const inputEl = document.getElementById(`cell-input-${selection.start.r}-${selection.start.c}`);
        if (inputEl) inputEl.focus();
        return;
      }

      // Tab – Move to next cell, Shift+Tab to move left
      if (e.key === "Tab" && selection.start) {
        e.preventDefault();
        const maxCols = (data[0]?.length || 26) - 1;
        const maxRows = data.length - 1;
        let { r, c } = selection.start;
        if (e.shiftKey) {
          c = c > 0 ? c - 1 : maxCols;
          if (c === maxCols && r > 0) r--;
        } else {
          c = c < maxCols ? c + 1 : 0;
          if (c === 0 && r < maxRows) r++;
        }
        const newSel = { start: { r, c }, end: { r, c } };
        setSelection(newSel);
        selectionRef.current = newSel;
        setFormulaInput(data[r]?.[c] || "");
        return;
      }

      // Arrow navigation
      if (selection.start && ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
        let { r, c } = selection.start;
        const maxRows = data.length - 1;
        const maxCols = (data[0]?.length || 26) - 1;

        if (e.key === "ArrowUp") r = Math.max(0, r - 1);
        if (e.key === "ArrowDown") r = Math.min(maxRows, r + 1);
        if (e.key === "ArrowLeft") c = Math.max(0, c - 1);
        if (e.key === "ArrowRight") c = Math.min(maxCols, c + 1);

        // If Shift is pressed, expand selection
        if (e.shiftKey) {
          const newSel = { start: selection.start, end: { r, c } };
          setSelection(newSel);
          selectionRef.current = newSel;
        } else {
          const newSel = { start: { r, c }, end: { r, c } };
          setSelection(newSel);
          selectionRef.current = newSel;
        }

        setFormulaInput(data[r]?.[c] || "");

        // Scroll the active cell into view if needed
        const cellId = `cell-${r}-${c}`;
        const cellEl = document.getElementById(cellId);
        if (cellEl) {
          cellEl.scrollIntoView({ block: "nearest", inline: "nearest" });
        }
      }

      // Enter to edit cell
      if (e.key === "Enter" && selection.start) {
        e.preventDefault();
        const inputEl = document.getElementById(`cell-input-${selection.start.r}-${selection.start.c}`);
        if (inputEl) {
          inputEl.focus();
        }
      }

      // Delete/Backspace to clear cells
      if ((e.key === "Delete" || e.key === "Backspace") && selection.start && selection.end) {
        e.preventDefault();
        const minR = Math.min(selection.start.r, selection.end.r);
        const maxR = Math.max(selection.start.r, selection.end.r);
        const minC = Math.min(selection.start.c, selection.end.c);
        const maxC = Math.max(selection.start.c, selection.end.c);

        const newData = [...data];
        for (let r = minR; r <= maxR; r++) {
          newData[r] = [...(newData[r] || [])];
          for (let c = minC; c <= maxC; c++) {
            newData[r][c] = "";
          }
        }
        updateCurrentSheet({ data: newData });
      }

      // Copy logic
      if (e.ctrlKey && e.key === "c" && selection.start && selection.end && !isEditingFormula) {
        const minR = Math.min(selection.start.r, selection.end.r);
        const maxR = Math.max(selection.start.r, selection.end.r);
        const minC = Math.min(selection.start.c, selection.end.c);
        const maxC = Math.max(selection.start.c, selection.end.c);

        const clipData: string[][] = [];
        for (let r = minR; r <= maxR; r++) {
          const rowData = [];
          for (let c = minC; c <= maxC; c++) {
            rowData.push(data[r]?.[c] || "");
          }
          clipData.push(rowData);
        }
        setClipboard({ data: clipData, start: { r: minR, c: minC } });
        // Also copy to system clipboard as TSV
        const tsv = clipData.map(row => row.join('\t')).join('\n');
        navigator.clipboard.writeText(tsv).catch(() => {});
        setSaveStatus(`Copied ${maxR - minR + 1}×${maxC - minC + 1} cells`);
      }

      // Escape key to reset selection & clipboard
      if (e.key === "Escape") {
        if (selection.start) {
          e.preventDefault();
          const newSel = { start: selection.start, end: selection.start };
          setSelection(newSel);
          selectionRef.current = newSel;
        }
        setClipboard(null);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Control") setCtrlPressed(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [selection, data, isEditingFormula, handleUndo, handleRedo, updateCurrentSheet, clipboard, rows, cols]);

  // Global mouseup and mousemove for drag-select
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setDraggingImageId(null);
      if (formulaDragging && formulaDragStart && isEditingFormula && selectionRef.current.start) {
        setFormulaDragging(false);
      }
      if (isDraggingRef.current) {
        setIsDragging(false);
        isDraggingRef.current = false;
        isDraggingHeaderRef.current = null;
      }
      if (isFillingRef.current) {
        applyAutoFill();
        setIsFilling(false);
        isFillingRef.current = false;
        setFillEnd(null);
        fillEndRef.current = null;
      }
    };

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (draggingImageId) {
        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;
        updateCurrentSheet({
          images: currentSheet.images?.map(img =>
            img.id === draggingImageId ? { ...img, x: newX, y: newY } : img
          )
        });
        return;
      }

      if (e.buttons === 0) {
        handleGlobalMouseUp();
        return;
      }
      if (!isDraggingRef.current && !isFillingRef.current && !formulaDragging) return;

      const el = document.elementFromPoint(e.clientX, e.clientY);
      if (!el) return;

      if (isDraggingHeaderRef.current === "col") {
        const headerEl = (el as HTMLElement).closest('[data-col-header]') as HTMLElement || el;
        const colStr = headerEl.getAttribute('data-col-header') || headerEl.parentElement?.getAttribute('data-col-header');
        if (colStr) {
          const c = parseInt(colStr);
          if (c >= 0 && selectionRef.current.start) {
            const newSel = { start: selectionRef.current.start, end: { r: rows - 1, c } };
            setSelection(newSel);
            selectionRef.current = newSel;
          }
        }
        return;
      }

      if (isDraggingHeaderRef.current === "row") {
        const headerEl = (el as HTMLElement).closest('[data-row-header]') as HTMLElement || el;
        const rowStr = headerEl.getAttribute('data-row-header') || headerEl.parentElement?.getAttribute('data-row-header');
        if (rowStr) {
          const r = parseInt(rowStr);
          if (r >= 0 && selectionRef.current.start) {
            const newSel = { start: selectionRef.current.start, end: { r, c: cols - 1 } };
            setSelection(newSel);
            selectionRef.current = newSel;
          }
        }
        return;
      }

      const cellEl = (el as HTMLElement).closest('[data-row]') as HTMLElement;
      if (!cellEl) return;

      const r = parseInt(cellEl.dataset.row || "-1");
      const c = parseInt(cellEl.dataset.col || "-1");
      if (r < 0 || c < 0) return;

      if (isDraggingRef.current && selectionRef.current.start) {
        const newSel = { start: selectionRef.current.start, end: { r, c } };
        setSelection(newSel);
        selectionRef.current = newSel;
      } else if (isFillingRef.current && selectionRef.current.end) {
        setFillEnd({ r, c });
        fillEndRef.current = { r, c };
      } else if (formulaDragging && formulaDragStart && isEditingFormula && selectionRef.current.start) {
        const startCol = String.fromCharCode(65 + formulaDragStart.c);
        const startRow = formulaDragStart.r + 1;
        const endCol = String.fromCharCode(65 + c);
        const endRow = r + 1;
        const baseFormula = formulaInput.replace(/[A-Z]+\d+(:[A-Z]+\d+)?$/, "");
        const rangeStr = (formulaDragStart.r === r && formulaDragStart.c === c)
          ? `${startCol}${startRow}`
          : `${startCol}${startRow}:${endCol}${endRow}`;
        const newFormulaInput = baseFormula + rangeStr;
        setFormulaInput(newFormulaInput);
        handleCellChange(selectionRef.current.start.r, selectionRef.current.start.c, newFormulaInput);
      }
    };

    window.addEventListener("mouseup", handleGlobalMouseUp);
    window.addEventListener("mousemove", handleGlobalMouseMove);
    return () => {
      window.removeEventListener("mouseup", handleGlobalMouseUp);
      window.removeEventListener("mousemove", handleGlobalMouseMove);
    };
  }, [formulaDragging, formulaDragStart, isEditingFormula, formulaInput, draggingImageId, dragOffset, currentSheet.images, applyAutoFill, cols, handleCellChange, rows, updateCurrentSheet]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = () => { setActiveMenu(null); setSheetContextMenu(null); };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Handle resizing mouse events
  useEffect(() => {
    if (!resizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (resizing.type === "col") {
        const delta = e.pageX - resizing.startPos;
        const newWidths = [...colWidths];
        newWidths[resizing.index] = Math.max(40, resizing.startSize + delta);
        updateCurrentSheet({ colWidths: newWidths });
      } else {
        const delta = e.pageY - resizing.startPos;
        const newHeights = [...rowHeights];
        newHeights[resizing.index] = Math.max(20, resizing.startSize + delta);
        updateCurrentSheet({ rowHeights: newHeights });
      }
    };

    const handleMouseUp = () => {
      setResizing(null);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [resizing, colWidths, rowHeights, updateCurrentSheet]);

  // Sync selection with Formula Bar
  useEffect(() => {
    if (selection.start) {
      const { r, c } = selection.start;
      setFormulaInput(data[r][c] || "");
    } else {
      setFormulaInput("");
    }
  }, [selection, data]);

  // Placeholder for auto-fill logic (integrated via handlers)
  useEffect(() => {
    // Fill handle drag is handled via component events
  }, [isFilling, selection]);

  // Computed data for formula execution
  const computedData = useMemo(() => {
    const parser = new Parser();
    const resultMatrix: (string | number)[][] = Array.from({ length: rows }, () => Array(cols).fill(""));
    const cycleGuard = new Set<string>();

    const toScalar = (value: unknown): string | number => {
      if (typeof value === "number" || typeof value === "string") return value;
      if (typeof value === "boolean") return value ? 1 : 0;
      return "";
    };

    parser.on("callCellValue", (cellCoord: ParserCellCoord, done: ParserDoneCallback) => {
      let r = cellCoord.row.index;
      let c = cellCoord.column.index;
      let targetData = data;
      let targetSheetName = sheets[activeSheetIndex]?.name || "";

      if (cellCoord.label && cellCoord.label.includes("!")) {
        const [sheetName, cellAddr] = cellCoord.label.split("!");
        const targetSheet = sheets.find(s => s.name === sheetName);
        if (targetSheet) {
          targetData = targetSheet.data;
          targetSheetName = targetSheet.name;
          const colMatch = cellAddr.match(/[a-zA-Z]+/);
          const rowMatch = cellAddr.match(/\d+/);
          if (colMatch && rowMatch) {
            c = colMatch[0].toUpperCase().split('').reduce((acc: number, char: string) => acc * 26 + (char.charCodeAt(0) - 64), 0) - 1;
            r = parseInt(rowMatch[0], 10) - 1;
          } else {
            done("");
            return;
          }
        } else {
          done("");
          return;
        }
      }

      const cellKey = `${targetSheetName}!${r}-${c}`;
      if (cycleGuard.has(cellKey)) {
        done("#REF!");
        return;
      }

      const val = targetData[r]?.[c] ?? "";
      if (typeof val === "string" && val.startsWith("=")) {
        cycleGuard.add(cellKey);
        const parsed = parser.parse(val.substring(1));
        cycleGuard.delete(cellKey);
        done(toScalar(Array.isArray(parsed.result) ? "" : parsed.result));
      } else if (typeof val === "string" && !isNaN(Number(val)) && val !== "") {
        done(Number(val));
      } else {
        done(toScalar(val));
      }
    });

    parser.on("callRangeValue", (startCellCoord: ParserCellCoord, endCellCoord: ParserCellCoord, done: ParserDoneCallback) => {
      const startR = Math.min(startCellCoord.row.index, endCellCoord.row.index);
      const endR = Math.max(startCellCoord.row.index, endCellCoord.row.index);
      const startC = Math.min(startCellCoord.column.index, endCellCoord.column.index);
      const endC = Math.max(startCellCoord.column.index, endCellCoord.column.index);

      let targetData = data;
      let targetSheetName = sheets[activeSheetIndex]?.name || "";

      if (startCellCoord.label && startCellCoord.label.includes("!")) {
        const sheetName = startCellCoord.label.split("!")[0];
        const targetSheet = sheets.find(s => s.name === sheetName);
        if (targetSheet) {
          targetData = targetSheet.data;
          targetSheetName = targetSheet.name;
        } else {
          done([] as (string | number)[][]);
          return;
        }
      }

      const fragment: (string | number)[][] = [];
      for (let r = startR; r <= endR; r++) {
        const colFragment: (string | number)[] = [];
        for (let c = startC; c <= endC; c++) {
          const cellKey = `${targetSheetName}!${r}-${c}`;
          if (cycleGuard.has(cellKey)) {
            colFragment.push("#REF!");
            continue;
          }

          const val = targetData[r]?.[c] ?? "";
          if (typeof val === "string" && val.startsWith("=")) {
            cycleGuard.add(cellKey);
            const parsed = parser.parse(val.substring(1));
            cycleGuard.delete(cellKey);
            colFragment.push(toScalar(Array.isArray(parsed.result) ? "" : parsed.result));
          } else if (typeof val === "string" && !isNaN(Number(val)) && val !== "") {
            colFragment.push(Number(val));
          } else {
            colFragment.push(toScalar(val));
          }
        }
        fragment.push(colFragment);
      }
      done(fragment);
    });

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const val = data[r][c];
        if (typeof val === "string" && val.startsWith("=")) {
          const processedFormula = val.substring(1).replace(/\(([^)]+)\)(#?[a-zA-Z]+[0-9]+)/g, "$1!$2");

          cycleGuard.clear();
          const rootCellKey = `${sheets[activeSheetIndex]?.name}!${r}-${c}`;
          cycleGuard.add(rootCellKey);

          const parsed = parser.parse(processedFormula);

          cycleGuard.delete(rootCellKey);

          if (parsed.error) {
            resultMatrix[r][c] = `#${parsed.error}`;
          } else {
            const normalized = toScalar(Array.isArray(parsed.result) ? "" : parsed.result);
            resultMatrix[r][c] = normalized;
          }
        } else {
          resultMatrix[r][c] = val;
        }
      }
    }

    return resultMatrix;
  }, [data, rows, cols, sheets, activeSheetIndex]);

  // Selection statistics for status bar (Sum, Average, Count, Min, Max)
  const selectionStats = useMemo(() => {
    if (!selection.start || !selection.end) return null;
    const minR = Math.min(selection.start.r, selection.end.r);
    const maxR = Math.max(selection.start.r, selection.end.r);
    const minC = Math.min(selection.start.c, selection.end.c);
    const maxC = Math.max(selection.start.c, selection.end.c);

    // Skip if only a single cell
    if (minR === maxR && minC === maxC) return null;

    const numbers: number[] = [];
    let count = 0;
    for (let r = minR; r <= maxR; r++) {
      for (let c = minC; c <= maxC; c++) {
        const val = computedData[r]?.[c];
        if (val !== "" && val !== undefined && val !== null) {
          count++;
          const num = typeof val === "number" ? val : parseFloat(String(val));
          if (!isNaN(num)) numbers.push(num);
        }
      }
    }
    if (numbers.length === 0) return count > 0 ? { count } : null;
    const sum = numbers.reduce((a, b) => a + b, 0);
    return {
      sum: Math.round(sum * 1e6) / 1e6,
      average: Math.round((sum / numbers.length) * 1e6) / 1e6,
      count,
      min: Math.min(...numbers),
      max: Math.max(...numbers),
      numCount: numbers.length,
    };
  }, [selection, computedData]);

  // Loading Logic
  useEffect(() => {
    const loadContent = async () => {
      if (!currentDocId) {
        const newId = `grid-${Date.now()}`;
        setCurrentDocId(newId);
        const { docName: snapshotDocName, sheets: snapshotSheets } = persistenceSnapshotRef.current;
        await persistenceService.saveDoc(newId, snapshotDocName, 'grid', JSON.stringify(snapshotSheets));
        return;
      }

      // Verify this is actually a grid document before parsing
      const docs = await persistenceService.getRecentDocs();
      const meta = docs.find(d => d.id === currentDocId);
      if (meta && meta.type !== 'grid') {
        console.warn("Document is not a grid type, skipping load:", currentDocId);
        const newId = `grid-${Date.now()}`;
        setCurrentDocId(newId);
        return;
      }

      const savedContent = await persistenceService.getDocContent(currentDocId);
      if (savedContent) {
        try {
          const parsedSheets = JSON.parse(savedContent);
          setSheets(parsedSheets);
          if (meta) setDocName(meta.name);
        } catch (e) {
          console.error("Failed to parse saved grid content", e);
        }
      }
    };

    loadContent();
  }, [currentDocId]);

  // Auto-save logic
  useEffect(() => {
    if (!currentDocId) return;

    if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current);
    setSaveStatus("Saving...");
    saveTimeoutRef.current = window.setTimeout(async () => {
      const result = await persistenceService.saveDoc(currentDocId, docName, 'grid', JSON.stringify(sheets));
      setSaveStatus(result.warning || "All changes saved");
    }, 1000) as unknown as number;
  }, [sheets, currentDocId, docName]);

  const addRow = () => {
    const newData = [...data, Array(cols).fill("")];
    const newHeights = [...rowHeights, 30];
    updateCurrentSheet({ rows: rows + 1, data: newData, rowHeights: newHeights });
  };

  const addCol = () => {
    const newData = data.map((row) => [...row, ""]);
    const newWidths = [...colWidths, 100];
    updateCurrentSheet({ cols: cols + 1, data: newData, colWidths: newWidths });
  };

  // Insert row at current selection position
  const insertRowAt = () => {
    const r = selection.start?.r ?? rows;
    const newRow = Array(cols).fill("");
    const newData = [...data.slice(0, r), newRow, ...data.slice(r)];
    const newHeights = [...rowHeights.slice(0, r), 30, ...rowHeights.slice(r)];
    // Shift cell styles
    const newStyles: Record<string, CellStyle> = {};
    for (const [key, value] of Object.entries(cellStyles)) {
      const [rr, cc] = key.split("-").map(Number);
      if (rr >= r) {
        newStyles[`${rr + 1}-${cc}`] = value;
      } else {
        newStyles[key] = value;
      }
    }
    updateCurrentSheet({ rows: rows + 1, data: newData, rowHeights: newHeights, cellStyles: newStyles });
  };

  // Delete row at current selection position
  const deleteRowAt = () => {
    if (rows <= 1) return;
    const r = selection.start?.r ?? rows - 1;
    const newData = [...data.slice(0, r), ...data.slice(r + 1)];
    const newHeights = [...rowHeights.slice(0, r), ...rowHeights.slice(r + 1)];
    // Shift cell styles
    const newStyles: Record<string, CellStyle> = {};
    for (const [key, value] of Object.entries(cellStyles)) {
      const [rr, cc] = key.split("-").map(Number);
      if (rr === r) continue; // skip deleted row
      if (rr > r) {
        newStyles[`${rr - 1}-${cc}`] = value;
      } else {
        newStyles[key] = value;
      }
    }
    updateCurrentSheet({ rows: rows - 1, data: newData, rowHeights: newHeights, cellStyles: newStyles });
  };

  // Insert column at current selection position
  const insertColAt = () => {
    const c = selection.start?.c ?? cols;
    const newData = data.map((row) => [...row.slice(0, c), "", ...row.slice(c)]);
    const newWidths = [...colWidths.slice(0, c), 100, ...colWidths.slice(c)];
    // Shift cell styles
    const newStyles: Record<string, CellStyle> = {};
    for (const [key, value] of Object.entries(cellStyles)) {
      const [rr, cc] = key.split("-").map(Number);
      if (cc >= c) {
        newStyles[`${rr}-${cc + 1}`] = value;
      } else {
        newStyles[key] = value;
      }
    }
    updateCurrentSheet({ cols: cols + 1, data: newData, colWidths: newWidths, cellStyles: newStyles });
  };

  // Delete column at current selection position
  const deleteColAt = () => {
    if (cols <= 1) return;
    const c = selection.start?.c ?? cols - 1;
    const newData = data.map((row) => [...row.slice(0, c), ...row.slice(c + 1)]);
    const newWidths = [...colWidths.slice(0, c), ...colWidths.slice(c + 1)];
    // Shift cell styles
    const newStyles: Record<string, CellStyle> = {};
    for (const [key, value] of Object.entries(cellStyles)) {
      const [rr, cc] = key.split("-").map(Number);
      if (cc === c) continue; // skip deleted column
      if (cc > c) {
        newStyles[`${rr}-${cc - 1}`] = value;
      } else {
        newStyles[key] = value;
      }
    }
    updateCurrentSheet({ cols: cols - 1, data: newData, colWidths: newWidths, cellStyles: newStyles });
  };

  // === Cell Merging ===
  const mergeCells = () => {
    if (!selection.start || !selection.end) return;
    const minR = Math.min(selection.start.r, selection.end.r);
    const maxR = Math.max(selection.start.r, selection.end.r);
    const minC = Math.min(selection.start.c, selection.end.c);
    const maxC = Math.max(selection.start.c, selection.end.c);
    
    // Single cell selected, nothing to merge
    if (minR === maxR && minC === maxC) return;
    
    // Check for existing overlapping merges
    const existing = currentSheet.mergedCells || [];
    const overlaps = existing.some(m => 
      !(maxR < m.startRow || minR > m.endRow || maxC < m.startCol || minC > m.endCol)
    );
    if (overlaps) {
      alert("Überlappende Zusammenführung nicht möglich.");
      return;
    }
    
    // First cell value becomes the merged cell value
    const mergedValue = data[minR][minC];
    const newData = data.map((row, r) => row.map((cell, c) => {
      if (r >= minR && r <= maxR && c >= minC && c <= maxC) {
        return (r === minR && c === minC) ? mergedValue : "";
      }
      return cell;
    }));
    
    const newMerge: MergedCell = { startRow: minR, startCol: minC, endRow: maxR, endCol: maxC };
    updateCurrentSheet({ 
      data: newData, 
      mergedCells: [...existing, newMerge] 
    });
    setSaveStatus("Zellen zusammengeführt");
  };

  const unmergeCells = () => {
    if (!selection.start) return;
    const r = selection.start.r;
    const c = selection.start.c;
    const existing = currentSheet.mergedCells || [];
    const mergeIdx = existing.findIndex(m => 
      r >= m.startRow && r <= m.endRow && c >= m.startCol && c <= m.endCol
    );
    if (mergeIdx === -1) return;
    
    const newMerged = [...existing];
    newMerged.splice(mergeIdx, 1);
    updateCurrentSheet({ mergedCells: newMerged });
    setSaveStatus("Zusammenführung aufgehoben");
  };

  // Check if a cell is part of a merged range (but not the top-left anchor)
  const isMergedSlave = (r: number, c: number): MergedCell | null => {
    const merges = currentSheet.mergedCells || [];
    for (const m of merges) {
      if (r >= m.startRow && r <= m.endRow && c >= m.startCol && c <= m.endCol) {
        if (r !== m.startRow || c !== m.startCol) return m;
      }
    }
    return null;
  };

  // Get merge info for a cell (if it's the anchor)
  const getMergeInfo = (r: number, c: number): MergedCell | null => {
    const merges = currentSheet.mergedCells || [];
    return merges.find(m => m.startRow === r && m.startCol === c) || null;
  };

  // === Freeze Panes ===
  const freezePanes = () => {
    if (!selection.start) return;
    const { r, c } = selection.start;
    updateCurrentSheet({ frozenRows: r, frozenCols: c });
    setSaveStatus(`Fixiert: ${r} Zeile(n), ${c} Spalte(n)`);
  };

  const unfreezePanes = () => {
    updateCurrentSheet({ frozenRows: 0, frozenCols: 0 });
    setSaveStatus("Fixierung aufgehoben");
  };

  // === Cell Comments ===
  const addCellComment = () => {
    if (!selection.start) return;
    const { r, c } = selection.start;
    const key = `${r}-${c}`;
    const current = cellStyles[key] || {};
    const existingComment = current.comment || "";
    const newComment = prompt("Kommentar eingeben:", existingComment);
    if (newComment !== null) {
      const newStyles = { ...cellStyles, [key]: { ...current, comment: newComment || undefined } };
      updateCurrentSheet({ cellStyles: newStyles });
    }
  };

  // === Add Conditional Formatting Rule ===
  const addConditionalRule = () => {
    if (!selection.start || !selection.end) return;
    const minR = Math.min(selection.start.r, selection.end.r);
    const maxR = Math.max(selection.start.r, selection.end.r);
    const minC = Math.min(selection.start.c, selection.end.c);
    const maxC = Math.max(selection.start.c, selection.end.c);
    
    const startCol = String.fromCharCode(65 + minC);
    const endCol = String.fromCharCode(65 + maxC);
    const rangeStr = `${startCol}${minR + 1}:${endCol}${maxR + 1}`;
    
    const newRule: ConditionalRule = {
      id: `rule-${Date.now()}`,
      range: rangeStr,
      type: condFormatType,
      value1: condFormatValue1,
      value2: condFormatValue2,
      style: {
        color: condFormatColor,
        bgColor: condFormatBgColor
      }
    };
    
    const existingRules = currentSheet.conditionalRules || [];
    updateCurrentSheet({ conditionalRules: [...existingRules, newRule] });
    setCondFormatOpen(false);
    setSaveStatus("Bedingte Formatierung hinzugefügt");
  };

  // === Remove all Conditional Formatting in selection ===
  const clearConditionalFormatting = () => {
    if (!selection.start) return;
    const minR = Math.min(selection.start.r, selection.end?.r || selection.start.r);
    const maxR = Math.max(selection.start.r, selection.end?.r || selection.start.r);
    const minC = Math.min(selection.start.c, selection.end?.c || selection.start.c);
    const maxC = Math.max(selection.start.c, selection.end?.c || selection.start.c);
    
    const existingRules = currentSheet.conditionalRules || [];
    // Filter out rules that overlap with the selection
    const newRules = existingRules.filter(rule => {
      const rangeMatch = rule.range.match(/([A-Z]+)(\d+):([A-Z]+)(\d+)/i);
      if (!rangeMatch) return true;
      const ruleStartCol = rangeMatch[1].toUpperCase().charCodeAt(0) - 65;
      const ruleStartRow = parseInt(rangeMatch[2], 10) - 1;
      const ruleEndCol = rangeMatch[3].toUpperCase().charCodeAt(0) - 65;
      const ruleEndRow = parseInt(rangeMatch[4], 10) - 1;
      // Keep if no overlap
      return maxR < ruleStartRow || minR > ruleEndRow || maxC < ruleStartCol || minC > ruleEndCol;
    });
    updateCurrentSheet({ conditionalRules: newRules });
    setSaveStatus("Bedingte Formatierung entfernt");
  };

  // === Conditional Formatting Helper ===
  const applyConditionalFormatting = (r: number, c: number, value: string | number, baseStyle: CellStyle): CellStyle => {
    const rules = currentSheet.conditionalRules || [];
    let resultStyle = { ...baseStyle };
    
    for (const rule of rules) {
      // Parse range (simple A1:B10 format)
      const rangeMatch = rule.range.match(/([A-Z]+)(\d+):([A-Z]+)(\d+)/i);
      if (!rangeMatch) continue;
      
      const startCol = rangeMatch[1].toUpperCase().charCodeAt(0) - 65;
      const startRow = parseInt(rangeMatch[2], 10) - 1;
      const endCol = rangeMatch[3].toUpperCase().charCodeAt(0) - 65;
      const endRow = parseInt(rangeMatch[4], 10) - 1;
      
      // Check if cell is in range
      if (r < startRow || r > endRow || c < startCol || c > endCol) continue;
      
      const numVal = typeof value === "number" ? value : parseFloat(String(value));
      const strVal = String(value).toLowerCase();
      let matches = false;
      
      switch (rule.type) {
        case "greaterThan":
          matches = !isNaN(numVal) && numVal > Number(rule.value1);
          break;
        case "lessThan":
          matches = !isNaN(numVal) && numVal < Number(rule.value1);
          break;
        case "equals":
          matches = strVal === String(rule.value1).toLowerCase() || numVal === Number(rule.value1);
          break;
        case "between":
          matches = !isNaN(numVal) && numVal >= Number(rule.value1) && numVal <= Number(rule.value2);
          break;
        case "text":
          matches = strVal.includes(String(rule.value1).toLowerCase());
          break;
        default:
          break;
      }
      
      if (matches) {
        resultStyle = { ...resultStyle, ...rule.style };
      }
    }
    
    return resultStyle;
  };

  const handleNewGrid = () => {
    if (confirm("Neue Mappe erstellen? Alle ungespeicherten Änderungen gehen verloren.")) {
      setSheets([{
        id: "sheet-1",
        name: "Tabelle1",
        rows: 10000,
        cols: 26,
        data: Array.from({ length: 10000 }, () => Array(26).fill("")),
        cellStyles: {},
        colWidths: Array(26).fill(100),
        rowHeights: Array(10000).fill(30),
      }]);
      setActiveSheetIndex(0);
      setSaveStatus("New workbook created");
    }
  };

  const addSheet = () => {
    const newSheetName = `Tabelle${sheets.length + 1}`;
    const newSheet: Sheet = {
      id: `sheet-${Date.now()}`,
      name: newSheetName,
      rows: 10000,
      cols: 26,
      data: Array.from({ length: 10000 }, () => Array(26).fill("")),
      cellStyles: {},
      colWidths: Array(26).fill(100),
      rowHeights: Array(10000).fill(30),
    };
    setSheets([...sheets, newSheet]);
    setActiveSheetIndex(sheets.length);
  };

  const renameSheet = (index: number) => {
    const currentName = sheets[index].name;
    const newName = prompt("Neuer Tabellenname:", currentName);
    if (newName && newName.trim()) {
      setSheets(prev => prev.map((s, i) => i === index ? { ...s, name: newName.trim() } : s));
    }
    setSheetContextMenu(null);
  };

  const deleteSheet = (index: number) => {
    if (sheets.length <= 1) {
      alert("Mindestens eine Tabelle muss bestehen bleiben.");
      setSheetContextMenu(null);
      return;
    }
    if (confirm(`Tabelle "${sheets[index].name}" wirklich löschen?`)) {
      const newSheets = sheets.filter((_, i) => i !== index);
      setSheets(newSheets);
      if (activeSheetIndex >= newSheets.length) {
        setActiveSheetIndex(newSheets.length - 1);
      }
    }
    setSheetContextMenu(null);
  };

  const handleOpenLocal = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (parsed.workbook) {
          setSheets(parsed.workbook);
          setActiveSheetIndex(0);
        } else if (parsed.data) {
          // Backward compatibility
          setSheets([{
            id: "sheet-1",
            name: "Tabelle1",
            rows: parsed.rows || parsed.data.length,
            cols: parsed.cols || parsed.data[0].length,
            data: parsed.data,
            cellStyles: parsed.cellStyles || {},
            colWidths: parsed.colWidths || Array(parsed.cols || 26).fill(100),
            rowHeights: parsed.rowHeights || Array(parsed.rows || 50).fill(30),
          }]);
        }
        setSaveStatus(`Opened: ${file.name}`);
      } catch (err) {
        console.error("Failed to parse native file", err);
        alert("Fehler beim Öffnen der Datei.");
      }
    };
    reader.readAsText(file);
  };

  const handleExport = () => {
    try {
      const wsData = [];
      for (let r = 0; r < rows; r++) {
        const rowData = [];
        for (let c = 0; c < cols; c++) {
          const val = data[r][c];
          if (typeof val === "string" && val.startsWith("=")) {
            // For simplicity, just export computed value for now
            rowData.push(computedData[r][c] || "");
          } else if (!isNaN(Number(val)) && val !== "") {
            rowData.push(Number(val));
          } else {
            rowData.push(val);
          }
        }
        wsData.push(rowData);
      }

      const ws = XLSX.utils.aoa_to_sheet(wsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
      XLSX.writeFile(wb, "SEPGrid_Export.xlsx");
    } catch (err) {
      console.error("Failed to export", err);
      alert("Failed to export to XLSX");
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    const csvRows: string[] = [];
    for (let r = 0; r < rows; r++) {
      if (!data[r].some(c => c !== "")) continue; // skip empty rows
      const rowValues = [];
      for (let c = 0; c < cols; c++) {
        let val = String(computedData[r]?.[c] ?? data[r][c] ?? "");
        // Escape values containing commas, quotes, or newlines
        if (val.includes('"') || val.includes(';') || val.includes('\n')) {
          val = '"' + val.replace(/"/g, '""') + '"';
        }
        rowValues.push(val);
      }
      csvRows.push(rowValues.join(";"));
    }
    const csvContent = csvRows.join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${docName || "SEPGrid_Export"}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    setSaveStatus("CSV exportiert");
  };

  // CSV Import
  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      if (!text) return;
      // Try semicolon first, then comma, then tab
      let separator = ";";
      const firstLine = text.split("\n")[0] || "";
      if (firstLine.includes("\t") && !firstLine.includes(";")) separator = "\t";
      else if (firstLine.includes(",") && !firstLine.includes(";")) separator = ",";
      
      const lines = text.split("\n").filter(l => l.trim() !== "");
      const parsedData: string[][] = lines.map(line => {
        // Basic CSV parsing with quote handling
        const result: string[] = [];
        let current = "";
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
          const ch = line[i];
          if (ch === '"') {
            if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
            else inQuotes = !inQuotes;
          } else if (ch === separator && !inQuotes) {
            result.push(current.trim());
            current = "";
          } else {
            current += ch;
          }
        }
        result.push(current.trim());
        return result;
      });

      const maxCols = Math.max(cols, ...parsedData.map(r => r.length));
      const maxRows = Math.max(rows, parsedData.length);
      const newData = Array.from({ length: maxRows }, (_, r) =>
        Array.from({ length: maxCols }, (_, c) => parsedData[r]?.[c] ?? "")
      );
      updateCurrentSheet({
        rows: maxRows,
        cols: maxCols,
        data: newData,
        colWidths: Array(maxCols).fill(100),
        rowHeights: Array(maxRows).fill(30),
      });
      setSaveStatus(`CSV importiert: ${parsedData.length} Zeilen`);
    };
    reader.readAsText(file, "utf-8");
    e.target.value = ""; // Reset file input
  };

  const handleSaveAs = () => {
    const jsonStr = JSON.stringify({ workbook: sheets });
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "GridWorkbook.sepg.json";
    a.click();
    window.URL.revokeObjectURL(url);
    setSaveStatus("Downloaded to local filesystem");
  };

  const applyStyle = (style: Partial<CellStyle>) => {
    if (!selection.start || !selection.end) return;
    const minR = Math.min(selection.start.r, selection.end.r);
    const maxR = Math.max(selection.start.r, selection.end.r);
    const minC = Math.min(selection.start.c, selection.end.c);
    const maxC = Math.max(selection.start.c, selection.end.c);

    const newStyles = { ...cellStyles };
    for (let r = minR; r <= maxR; r++) {
      for (let c = minC; c <= maxC; c++) {
        const key = `${r}-${c}`;
        const current = newStyles[key] || {};
        // Toggle if boolean flag passed as exactly true/false toggle for text formatting
        const updatedStyle = { ...current };

        if (style.bold !== undefined) updatedStyle.bold = !current.bold;
        if (style.italic !== undefined) updatedStyle.italic = !current.italic;
        if (style.underline !== undefined) updatedStyle.underline = !current.underline;
        if (style.align !== undefined) updatedStyle.align = style.align;
        if (style.color !== undefined) updatedStyle.color = style.color;
        if (style.bgColor !== undefined) updatedStyle.bgColor = style.bgColor;
        if (style.autoColor !== undefined) updatedStyle.autoColor = !current.autoColor;
        if (style.numberFormat !== undefined) updatedStyle.numberFormat = style.numberFormat;

        if (style.borders !== undefined) {
          updatedStyle.borders = { ...(current.borders || {}), ...style.borders };
        }

        newStyles[key] = updatedStyle;
      }
    }
    updateCurrentSheet({ cellStyles: newStyles });
  };

  const handlePasteTransposed = () => {
    if (!clipboard || !selection.start) return;

    const startR = selection.start.r;
    const startC = selection.start.c;
    const clipRows = clipboard.data.length;
    let clipCols = 0;
    if (clipRows > 0) clipCols = clipboard.data[0].length;

    const newData = [...data];

    // Transpose: swap rows and cols
    for (let r = 0; r < clipRows; r++) {
      for (let c = 0; c < clipCols; c++) {
        const targetR = startR + c;
        const targetC = startC + r;
        if (targetR < rows && targetC < cols) {
          if (!newData[targetR] || newData[targetR] === data[targetR]) {
            newData[targetR] = [...newData[targetR]];
          }
          newData[targetR][targetC] = clipboard.data[r][c];
        }
      }
    }
    updateCurrentSheet({ data: newData });
    setSaveStatus("Transposed Paste Complete");
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const dotIndex = file.name.lastIndexOf(".");
    const extension = dotIndex >= 0 ? file.name.slice(dotIndex).toLowerCase() : "";
    if (!ALLOWED_IMPORT_EXTENSIONS.includes(extension)) {
      alert("Nur .xlsx oder .xlsm Dateien dürfen importiert werden.");
      return;
    }
    if (file.size > MAX_IMPORT_FILE_SIZE) {
      alert(`Datei zu groß (${(file.size / (1024 * 1024)).toFixed(2)} MB). Maximal ${MAX_IMPORT_FILE_SIZE / (1024 * 1024)} MB erlaubt.`);
      return;
    }

    try {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: "array" });
      const wsName = wb.SheetNames[0];
      if (!wsName) {
        alert("Die Datei enthält kein Tabellenblatt.");
        return;
      }
      const ws = wb.Sheets[wsName];
      const scanResult = scanWorksheetForRisks(ws);
      if (scanResult.fatal) {
        alert(`Import blockiert: ${scanResult.fatal}`);
        return;
      }

      if (scanResult.warnings.length) {
        console.warn("Import warnings:", scanResult.warnings);
      }

      const importedData = XLSX.utils.sheet_to_json(ws, {
        header: 1,
        raw: false,
      }) as unknown[][];

      const limitedData = importedData.slice(0, MAX_IMPORT_ROWS);
      const actualRows = limitedData.length;
      const actualCols = limitedData.reduce(
        (max, row) => Math.max(max, row?.length ?? 0),
        0,
      );

      const targetRows = Math.min(Math.max(1000, actualRows + 5), MAX_IMPORT_ROWS);
      const targetCols = Math.min(Math.max(26, actualCols + 2), MAX_IMPORT_COLS);

      const parsedData: string[][] = [];
      for (let r = 0; r < targetRows; r++) {
        parsedData.push(Array(targetCols).fill(""));
      }

      for (let r = 0; r < Math.min(actualRows, targetRows); r++) {
        const row = limitedData[r] || [];
        for (let c = 0; c < targetCols; c++) {
          const val = row[c];
          parsedData[r][c] = sanitizeImportedValue(val);
        }
      }

      updateCurrentSheet({
        data: parsedData,
        rows: targetRows,
        cols: targetCols,
        colWidths: Array(targetCols).fill(100),
        rowHeights: Array(targetRows).fill(30),
        cellStyles: {}
      });
      const importStatus = scanResult.warnings.length
        ? `Imported with warnings: ${scanResult.warnings.join(" | ")}`
        : "Imported successfully";
      setSaveStatus(importStatus);

      if (importFileInputRef.current) importFileInputRef.current.value = "";
    } catch (err) {
      console.error("Failed to import", err);
      alert("Failed to import file. Make sure it is a valid XLSX or ODS file.");
    }
  };

  const handleSort = (colIndex: number) => {
    const direction =
      sortConfig?.col === colIndex && sortConfig.direction === "asc"
        ? "desc"
        : "asc";
    setSortConfig({ col: colIndex, direction });

    const sortedData = [...data].sort((a: string[], b: string[]) => {
      const valA = a[colIndex] || "";
      const valB = b[colIndex] || "";
      const isNumA = !isNaN(Number(valA)) && valA !== "";
      const isNumB = !isNaN(Number(valB)) && valB !== "";

      if (isNumA && isNumB) {
        return direction === "asc" ? Number(valA) - Number(valB) : Number(valB) - Number(valA);
      }
      if (valA < valB) return direction === "asc" ? -1 : 1;
      if (valA > valB) return direction === "asc" ? 1 : -1;
      return 0;
    });

    updateCurrentSheet({ data: sortedData });
    setSaveStatus("Unsaved changes (Sorted)");
  };

  const handleGenerateFormula = async () => {
    if (!selection.start || !nlpQuery.trim()) return;
    setIsGeneratingFormula(true);
    try {
      const formula = await ai.generateFormula(aiSettings, nlpQuery);
      if (formula && selection.start) {
        handleCellChange(selection.start.r, selection.start.c, formula);
        setNlpQuery("");
      }
    } catch (err) {
      console.error("Failed to generate formula", err);
    } finally {
      setIsGeneratingFormula(false);
    }
  };

  // Very basic chart data extraction:
  // Assumes Row 1 has labels, Row 2 has numeric data for the chart
  const chartData = useMemo(() => {
    if (!showChart) return [];
    const labels = computedData[0] || [];
    const values = computedData[1] || [];

    const cData = [];
    for (let i = 0; i < cols; i++) {
      if (labels[i] && values[i] && !isNaN(Number(values[i]))) {
        cData.push({
          name: labels[i],
          value: Number(values[i]),
        });
      }
    }
    return cData;
  }, [computedData, showChart, cols]);

  const handleOpenAiPrompt = (context: string) => {
    setAiPromptContext(context);
    setAiPromptInput("");
    setAiPromptOpen(true);
    setActiveMenu(null);
  };

  const handleAiActionSubmit = async () => {
    if (!aiPromptInput.trim()) return;
    setIsPromptingAI(true);
    try {
      const computedDataStrings = computedData.map((row) => row.map((val) => val.toString()));
      const response = await ai.gridAction(aiSettings, aiPromptContext, aiPromptInput, data, computedDataStrings);

      if (!response) throw new Error("Keine Antwort der KI");

      if (response.type === "raw_data" && response.data) {
        // Fallback or local mode
        updateCurrentSheet({ data: response.data });
        setSaveStatus(`Angewendet (Raw): ${aiPromptContext}`);
      } else if (response.type === "tools" && response.calls) {
        // Tool calling Mode
        for (const call of response.calls) {
          if (!call.function?.arguments) continue;
          let args;
          try {
            args = JSON.parse(call.function.arguments);
          } catch { continue; }
          handleEliotAction(call.function.name, args);
        }
        setSaveStatus(`KI Aktion ausgeführt: ${aiPromptContext}`);
      }

    } catch (err) {
      console.error(err);
      alert("KI konnte die Aktion nicht ausführen.");
    } finally {
      setIsPromptingAI(false);
      setAiPromptOpen(false);
    }
  };

  function handleEliotAction(name: string, args: any) {
    const parseCell = (ref: string) => {
      if (!ref) return null;
      const match = ref.match(/([A-Z]+)(\d+)/);
      if (!match) return null;
      const col = match[1].split('').reduce((acc, char) => acc * 26 + char.charCodeAt(0) - 64, 0) - 1;
      const row = parseInt(match[2]) - 1;
      return { r: row, c: col };
    };

    const parseRange = (range: string) => {
      if (!range) return null;
      const parts = range.split(":");
      if (parts.length !== 2) return null;
      const start = parseCell(parts[0]);
      const end = parseCell(parts[1]);
      if (!start || !end) return null;
      return { start, end };
    };

    if (name === "add_sheet") {
      const news: Sheet = {
        id: `sheet-${Date.now()}`,
        name: args.name || `Tabelle ${sheets.length + 1}`,
        rows: 1000,
        cols: 26,
        data: Array.from({ length: 1000 }, () => Array(26).fill("")),
        cellStyles: {},
        colWidths: Array(26).fill(100),
        rowHeights: Array(1000).fill(30),
        images: [],
      };
      setSheets(prev => [...prev, news]);
      setActiveSheetIndex(sheets.length);
      setSaveStatus(`Blatt '${news.name}' hinzugefügt`);
      return;
    }

    if (name === "select_sheet") {
      const idx = sheets.findIndex(s => s.name === args.name || s.id === args.id);
      if (idx !== -1) setActiveSheetIndex(idx);
      else if (args.index !== undefined && args.index < sheets.length) setActiveSheetIndex(args.index);
      return;
    }

    if (name === "rename_sheet") {
      setSheets(prev => prev.map((s, i) => (i === activeSheetIndex || s.name === args.oldName) ? { ...s, name: args.newName } : s));
      return;
    }

    setSheets(prev => {
      let targetIdx = activeSheetIndex;
      if (args.sheetName) {
        const found = prev.findIndex(s => s.name === args.sheetName);
        if (found !== -1) targetIdx = found;
      }

      return prev.map((s, i) => {
        if (i !== targetIdx) return s;
        const nextData = [...s.data];
        const nextStyles = { ...s.cellStyles };
        let changed = false;

        if (name === "update_values" && args.startCell && args.values) {
          const start = parseCell(args.startCell);
          if (start) {
            args.values.forEach((rowVals: any[], rIdx: number) => {
              const r = start.r + rIdx;
              if (r < s.rows) {
                nextData[r] = [...nextData[r]];
                rowVals.forEach((val, cIdx) => {
                  const c = start.c + cIdx;
                  if (c < s.cols) nextData[r][c] = val?.toString() || "";
                });
              }
            });
            changed = true;
          }
        } else if (name === "format_cells" && args.range && args.style) {
          const range = parseRange(args.range);
          if (range) {
            for (let r = range.start.r; r <= range.end.r; r++) {
              for (let c = range.start.c; c <= range.end.c; c++) {
                const styleKey = `${r}-${c}`;
                const mergedStyle = { ...nextStyles[styleKey], ...args.style };
                // Auto-set contrasting text color when bgColor is set but no text color given
                if (args.style.bgColor && !args.style.color) {
                  const bg = args.style.bgColor;
                  if (bg && bg.startsWith('#') && bg.length >= 7) {
                    const hex = bg.replace('#', '');
                    const rr = parseInt(hex.substring(0, 2), 16);
                    const gg = parseInt(hex.substring(2, 4), 16);
                    const bb = parseInt(hex.substring(4, 6), 16);
                    const luminance = (0.299 * rr + 0.587 * gg + 0.114 * bb) / 255;
                    mergedStyle.color = luminance > 0.5 ? '#0f172a' : '#f8fafc';
                  }
                }
                nextStyles[styleKey] = mergedStyle;
              }
            }
            changed = true;
          }
        } else if (name === "clear_range" && args.range) {
          const range = parseRange(args.range);
          if (range) {
            for (let r = range.start.r; r <= range.end.r; r++) {
              nextData[r] = [...nextData[r]];
              for (let c = range.start.c; c <= range.end.c; c++) {
                nextData[r][c] = "";
              }
            }
            changed = true;
          }
        }

        return changed ? { ...s, data: nextData, cellStyles: nextStyles } : s;
      });
    });
    setSaveStatus("Eliot hat Änderungen vorgenommen.");
  };

  const handleAiGenerateTable = async () => {
    if (!aiGeneratePrompt.trim()) return;
    setIsGeneratingTable(true);
    try {
      const tableData = await ai.generateSpreadsheet(aiSettings, aiGeneratePrompt, cols);
      if (tableData && tableData.length > 0) {
        const newData = [...data];
        for (let r = 0; r < tableData.length && r < rows; r++) {
          newData[r] = [...newData[r]];
          for (let c = 0; c < tableData[r].length && c < cols; c++) {
            newData[r][c] = tableData[r][c]?.toString() || "";
          }
        }
        updateCurrentSheet({ data: newData });
        setSaveStatus("KI-Tabelle erstellt!");
      }
    } catch (err) {
      console.error(err);
      alert("KI konnte die Tabelle nicht erstellen.");
    } finally {
      setIsGeneratingTable(false);
      setAiGenerateOpen(false);
      setAiGeneratePrompt("");
    }
  };

  // === Find & Replace ===
  const handleFind = (searchText: string) => {
    if (!searchText) { setFindResults([]); setFindIndex(0); return; }
    const results: { r: number; c: number }[] = [];
    const lower = searchText.toLowerCase();
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const val = String(data[r]?.[c] || "").toLowerCase();
        const computed = String(computedData[r]?.[c] || "").toLowerCase();
        if (val.includes(lower) || computed.includes(lower)) {
          results.push({ r, c });
        }
      }
    }
    setFindResults(results);
    setFindIndex(0);
    if (results.length > 0) {
      const { r, c } = results[0];
      const newSel = { start: { r, c }, end: { r, c } };
      setSelection(newSel);
      selectionRef.current = newSel;
      document.getElementById(`cell-${r}-${c}`)?.scrollIntoView({ block: "nearest", inline: "nearest" });
    }
  };

  const handleFindNext = () => {
    if (findResults.length === 0) return;
    const nextIdx = (findIndex + 1) % findResults.length;
    setFindIndex(nextIdx);
    const { r, c } = findResults[nextIdx];
    const newSel = { start: { r, c }, end: { r, c } };
    setSelection(newSel);
    selectionRef.current = newSel;
    document.getElementById(`cell-${r}-${c}`)?.scrollIntoView({ block: "nearest", inline: "nearest" });
  };

  const handleFindPrev = () => {
    if (findResults.length === 0) return;
    const prevIdx = (findIndex - 1 + findResults.length) % findResults.length;
    setFindIndex(prevIdx);
    const { r, c } = findResults[prevIdx];
    const newSel = { start: { r, c }, end: { r, c } };
    setSelection(newSel);
    selectionRef.current = newSel;
    document.getElementById(`cell-${r}-${c}`)?.scrollIntoView({ block: "nearest", inline: "nearest" });
  };

  const handleReplace = () => {
    if (findResults.length === 0 || !findText) return;
    const { r, c } = findResults[findIndex];
    const newData = data.map(row => [...row]);
    newData[r][c] = String(newData[r][c]).replace(new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), replaceText);
    updateCurrentSheet({ data: newData });
    handleFind(findText); // re-search
  };

  const handleReplaceAll = () => {
    if (findResults.length === 0 || !findText) return;
    const escaped = findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'gi');
    const newData = data.map(row => [...row]);
    let count = 0;
    for (const { r, c } of findResults) {
      const oldVal = String(newData[r][c]);
      const newVal = oldVal.replace(regex, replaceText);
      if (newVal !== oldVal) { newData[r][c] = newVal; count++; }
    }
    updateCurrentSheet({ data: newData });
    setFindResults([]);
    setFindIndex(0);
    setSaveStatus(`${count} Ersetzungen durchgeführt`);
  };

  // === CSV Generation for RAG Context ===
  const getGridCSV = () => {
    let csv = "";
    for (let r = 0; r < Math.min(rows, 50); r++) { // Limit to 50 rows so we don't blow up token limits
      const rowData = [];
      let rowHasData = false;
      for (let c = 0; c < Math.min(cols, 26); c++) {
        const val = data[r][c];
        if (val) rowHasData = true;
        rowData.push(val);
      }
      if (rowHasData) {
        // Prefix with Row Index (1-based)
        csv += `${r + 1},${rowData.join(",")}\n`;
      }
    }
    // Add column headers if there is data
    if (csv) {
      let headers = "Row,";
      for (let c = 0; c < Math.min(cols, 26); c++) {
        headers += String.fromCharCode(65 + c) + ",";
      }
      return headers.slice(0, -1) + "\n" + csv;
    }
    return "Tabelle ist leer.";
  };

  return (
    <div className="grid-wrapper fade-in" style={{ position: "relative" }}>
      {/* AI Prompt Modal (Glassmorphism Overlay) */}
      {aiPromptOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(15, 23, 42, 0.7)",
            backdropFilter: "blur(4px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "rgba(30, 41, 59, 0.95)",
              border: "1px solid var(--glass-border)",
              padding: "2rem",
              borderRadius: "12px",
              width: "100%",
              maxWidth: "500px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
            }}
          >
            <h3
              style={{
                margin: "0 0 1rem 0",
                color: "#f8fafc",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <Sparkles size={18} color="#38bdf8" /> KI-Assistent:{" "}
              {aiPromptContext}
            </h3>
            <p
              style={{
                color: "#94a3b8",
                fontSize: "0.9rem",
                marginBottom: "1rem",
              }}
            >
              Beschreibe in natürlicher Sprache, was du machen möchtest. Die KI
              übernimmt die komplexe Umsetzung in der Tabelle.
            </p>
            <textarea
              autoFocus
              value={aiPromptInput}
              onChange={(e) => setAiPromptInput(e.target.value)}
              placeholder="z.B. Erstelle eine Pivot-Tabelle, die den Umsatz (Spalte C) pro Monat (Spalte A) summiert..."
              style={{
                width: "100%",
                height: "100px",
                padding: "0.75rem",
                background: "rgba(15, 23, 42, 0.5)",
                border: "1px solid var(--glass-border)",
                borderRadius: "8px",
                color: "#e2e8f0",
                fontSize: "0.95rem",
                resize: "none",
                outline: "none",
                marginBottom: "1rem",
              }}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "1rem",
              }}
            >
              <button
                className="nav-btn"
                onClick={() => setAiPromptOpen(false)}
              >
                Abbrechen
              </button>
              <button
                className="nav-btn"
                style={{ background: "#0284c7", color: "white" }}
                onClick={handleAiActionSubmit}
                disabled={isPromptingAI}
              >
                {isPromptingAI ? "Führe aus..." : "Anwenden"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Generate Table Modal */}
      {aiGenerateOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.7)",
            backdropFilter: "blur(4px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "rgba(30, 41, 59, 0.95)",
              border: "1px solid var(--glass-border)",
              padding: "2rem",
              borderRadius: "12px",
              width: "100%",
              maxWidth: "500px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
            }}
          >
            <h3
              style={{
                margin: "0 0 1rem 0",
                color: "#f8fafc",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <Sparkles size={18} color="#38bdf8" /> KI: Tabelle erstellen
            </h3>
            <p
              style={{
                color: "#94a3b8",
                fontSize: "0.9rem",
                marginBottom: "1rem",
              }}
            >
              Beschreibe, welche Tabelle du brauchst. Die KI erstellt die
              Struktur und füllt sie mit sinnvollen Daten.
            </p>
            <textarea
              autoFocus
              value={aiGeneratePrompt}
              onChange={(e) => setAiGeneratePrompt(e.target.value)}
              placeholder="z.B. Erstelle einen Projektplan mit 10 Meilensteinen, Spalten: Aufgabe, Verantwortlich, Start, Ende, Status..."
              style={{
                width: "100%",
                height: "100px",
                padding: "0.75rem",
                background: "rgba(15, 23, 42, 0.5)",
                border: "1px solid var(--glass-border)",
                borderRadius: "8px",
                color: "#e2e8f0",
                fontSize: "0.95rem",
                resize: "none",
                outline: "none",
                marginBottom: "1rem",
              }}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "1rem",
              }}
            >
              <button
                className="nav-btn"
                onClick={() => { setAiGenerateOpen(false); setAiGeneratePrompt(""); }}
              >
                Abbrechen
              </button>
              <button
                className="nav-btn"
                style={{ background: "#0284c7", color: "white" }}
                onClick={handleAiGenerateTable}
                disabled={isGeneratingTable}
              >
                {isGeneratingTable ? "Erstelle..." : "✨ Erstellen"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        style={{
          marginBottom: "1rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "rgba(15, 23, 42, 0.6)",
          padding: "0.5rem 1rem",
          borderRadius: "8px",
          border: "1px solid var(--glass-border)",
        }}
      >
        {/* Modern Ribbon Menu */}
        <div style={{ display: "flex", gap: "1rem" }}>
          {/* FILE MENU */}
          <div style={{ position: "relative" }}>
            <button
              className={`nav-btn ${activeMenu === "file" ? "active" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                setActiveMenu(activeMenu === "file" ? null : "file");
              }}
            >
              Datei
            </button>
            {activeMenu === "file" && (
              <div className="dropdown-menu">
                <button
                  onClick={() => {
                    handleNewGrid();
                    setActiveMenu(null);
                  }}
                >
                  <Sparkles size={14} /> {t('new')}
                </button>
                <button
                  onClick={() => {
                    openFileInputRef.current?.click();
                    setActiveMenu(null);
                  }}
                >
                  <Upload size={14} /> {t('open')} (.sepg)
                </button>
                <input
                  type="file"
                  accept=".sepg.json"
                  ref={openFileInputRef}
                  onChange={handleOpenLocal}
                  style={{ display: "none" }}
                />
                <div className="dropdown-divider"></div>
                <button
                  onClick={() => {
                    handleSaveAs(); // Standard save for now is download
                    setActiveMenu(null);
                  }}
                >
                  <Download size={14} /> {t('save')}
                </button>
                <div className="dropdown-divider"></div>
                <button
                  onClick={() => {
                    setIsPrintModalOpen(true);
                    setActiveMenu(null);
                  }}
                >
                  <Printer size={14} /> {t('print')} / PDF
                </button>
                <button
                  onClick={() => {
                    setIsImageModalOpen(true);
                    setActiveMenu(null);
                  }}
                >
                  <Sparkles size={14} color="#38bdf8" /> Bild einfügen
                </button>
                <button
                  onClick={() => {
                    importFileInputRef.current?.click();
                    setActiveMenu(null);
                  }}
                >
                  <Upload size={14} /> Importieren (.xlsx, .ods)
                </button>
                <input
                  type="file"
                  accept=".xlsx,.ods"
                  ref={importFileInputRef}
                  onChange={handleImport}
                  style={{ display: "none" }}
                />
                <button
                  onClick={() => {
                    handleExport();
                    setActiveMenu(null);
                  }}
                >
                  <Download size={14} /> Exportieren (.xlsx)
                </button>
                <div className="dropdown-divider"></div>
                <button
                  onClick={() => {
                    csvImportRef.current?.click();
                    setActiveMenu(null);
                  }}
                >
                  <Upload size={14} /> CSV importieren
                </button>
                <input
                  type="file"
                  accept=".csv,.tsv,.txt"
                  ref={csvImportRef}
                  onChange={handleImportCSV}
                  style={{ display: "none" }}
                />
                <button
                  onClick={() => {
                    handleExportCSV();
                    setActiveMenu(null);
                  }}
                >
                  <Download size={14} /> CSV exportieren
                </button>
              </div>
            )}
          </div>

          <div style={{ marginLeft: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="text"
              value={docName}
              onChange={(e) => setDocName(e.target.value)}
              onBlur={() => {
                if (currentDocId) {
                  persistenceService.saveDoc(currentDocId, docName, 'grid', JSON.stringify(sheets));
                }
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#f8fafc',
                fontSize: '0.95rem',
                fontWeight: 500,
                outline: 'none',
                padding: '4px 8px',
                borderRadius: '4px',
                width: '200px'
              }}
              className="doc-title-input"
              placeholder="Unbenannte Tabelle"
            />
          </div>
        </div>

        <div className="ribbon-divider" />

        <div className="ribbon-group">
          <button className="ribbon-btn" title="Rückgängig (Ctrl+Z)" onClick={handleUndo}><Undo2 size={16} /></button>
          <button className="ribbon-btn" title="Wiederholen (Ctrl+Y)" onClick={handleRedo}><Redo2 size={16} /></button>
        </div>

        <div className="ribbon-divider" />

        {/* EDIT TOOLS */}
        <div className="ribbon-group">
          <button className="ribbon-btn" title="Fett" onClick={() => applyStyle({ bold: true })}><BoldIcon size={16} /></button>
          <button className="ribbon-btn" title="Kursiv" onClick={() => applyStyle({ italic: true })}><ItalicIcon size={16} /></button>
          <button className="ribbon-btn" title="Unterstreichen" onClick={() => applyStyle({ underline: true })}><UnderlineIcon size={16} /></button>
        </div>

        <div className="ribbon-divider" />

        <div className="ribbon-group">
          <button className="ribbon-btn" title="Links bündig" onClick={() => applyStyle({ align: "left" })}><AlignLeft size={16} /></button>
          <button className="ribbon-btn" title="Zentriert" onClick={() => applyStyle({ align: "center" })}><AlignCenter size={16} /></button>
          <button className="ribbon-btn" title="Rechts bündig" onClick={() => applyStyle({ align: "right" })}><AlignRight size={16} /></button>
        </div>

        <div className="ribbon-divider" />

        <div className="ribbon-group">
          <div style={{ position: "relative", display: "flex", alignItems: "center" }} title="Textfarbe" className="ribbon-btn">
            <Type size={16} />
            <input
              type="color"
              onChange={(e) => applyStyle({ color: e.target.value })}
              style={{ position: "absolute", opacity: 0, width: "100%", height: "100%", cursor: "pointer" }}
            />
          </div>
          <div style={{ position: "relative", display: "flex", alignItems: "center" }} title="Hintergrundfarbe" className="ribbon-btn">
            <Palette size={16} />
            <input
              type="color"
              onChange={(e) => applyStyle({ bgColor: e.target.value })}
              style={{ position: "absolute", opacity: 0, width: "100%", height: "100%", cursor: "pointer" }}
            />
          </div>
          <button
            className="ribbon-btn"
            title="Automatische Farben (Eingabe Weiß, Minus Rot, Plus Grün)"
            onClick={() => applyStyle({ autoColor: true })}
          >
            ✨
          </button>
          <div style={{ position: "relative" }}>
            <button
              className="ribbon-btn"
              title="Rahmenlinien"
              onClick={(e) => {
                e.stopPropagation();
                setActiveMenu(activeMenu === "borders" ? null : "borders");
              }}
            >
              <Grid3X3 size={16} />
            </button>
            {activeMenu === "borders" && (
              <div className="dropdown-menu" style={{ position: "absolute", top: "100%", left: 0, zIndex: 100, minWidth: "200px" }}>
                <button onClick={() => { applyStyle({ borders: { top: true, right: true, bottom: true, left: true } }); setActiveMenu(null); }}>
                  ▣ Alle Rahmenlinien
                </button>
                <button onClick={() => { applyStyle({ borders: { top: true, right: true, bottom: true, left: true } }); setActiveMenu(null); }}>
                  ▢ Äußere Rahmenlinien
                </button>
                <div className="dropdown-divider"></div>
                <button onClick={() => { applyStyle({ borders: { top: true } }); setActiveMenu(null); }}>
                  ▔ Oberer Rand
                </button>
                <button onClick={() => { applyStyle({ borders: { bottom: true } }); setActiveMenu(null); }}>
                  ▁ Unterer Rand
                </button>
                <button onClick={() => { applyStyle({ borders: { left: true } }); setActiveMenu(null); }}>
                  ▏ Linker Rand
                </button>
                <button onClick={() => { applyStyle({ borders: { right: true } }); setActiveMenu(null); }}>
                  ▕ Rechter Rand
                </button>
                <div className="dropdown-divider"></div>
                <button onClick={() => { applyStyle({ borders: { top: false, right: false, bottom: false, left: false } }); setActiveMenu(null); }}>
                  ✕ Keine Rahmenlinien
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="ribbon-divider" />

        <div className="ribbon-group">
          {/* Number Format Dropdown */}
          <div style={{ position: "relative" }}>
            <button className="ribbon-btn" title="Zahlenformat" onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === "numfmt" ? null : "numfmt"); }}
              style={{ fontSize: "0.75rem", minWidth: "32px" }}>
              123
            </button>
            {activeMenu === "numfmt" && (
              <div className="dropdown-menu" style={{ minWidth: "180px" }}>
                <button onClick={() => { applyStyle({ numberFormat: "general" }); setActiveMenu(null); }}>
                  Standard
                </button>
                <button onClick={() => { applyStyle({ numberFormat: "number" }); setActiveMenu(null); }}>
                  Zahl (1.234,56)
                </button>
                <button onClick={() => { applyStyle({ numberFormat: "currency" }); setActiveMenu(null); }}>
                  💶 Währung (€)
                </button>
                <button onClick={() => { applyStyle({ numberFormat: "percent" }); setActiveMenu(null); }}>
                  % Prozent
                </button>
                <button onClick={() => { applyStyle({ numberFormat: "thousand" }); setActiveMenu(null); }}>
                  1.000 Tausender
                </button>
                <button onClick={() => { applyStyle({ numberFormat: "date" }); setActiveMenu(null); }}>
                  📅 Datum
                </button>
              </div>
            )}
          </div>
          <button className="ribbon-btn" title="Summe (Σ)" onClick={() => {
            // Simple AutoSum logic: Sum column above
            if (selection.start) {
              const { r, c } = selection.start;
              let sumRange = "";
              if (r > 0) {
                const colLetter = String.fromCharCode(65 + c);
                sumRange = `=SUM(${colLetter}1:${colLetter}${r})`;
              }
              handleCellChange(r, c, sumRange);
            }
          }}><Sigma size={16} /></button>
          <button className="ribbon-btn" title="Sortieren (A-Z)" onClick={() => {
            if (selection.start) handleSort(selection.start.c);
          }}><SortAsc size={16} /></button>
        </div>

        <div className="ribbon-divider" />

        {/* EDIT MENU (Paste Special) */}
        <div style={{ position: "relative" }}>
          <button
            className={`nav-btn ${activeMenu === "edit" ? "active" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              setActiveMenu(activeMenu === "edit" ? null : "edit");
            }}
          >
            Bearbeiten
          </button>
          {activeMenu === "edit" && (
            <div className="dropdown-menu">
              <button
                onClick={() => {
                  handlePasteTransposed();
                  setActiveMenu(null);
                }}
                disabled={!clipboard}
              >
                Transponiert Einfügen (Spalten zu Zeilen)
              </button>
              <div className="dropdown-divider"></div>
              <button
                onClick={() => {
                  setFindReplaceOpen(true);
                  setActiveMenu(null);
                }}
              >
                🔍 Suchen & Ersetzen (Strg+F)
              </button>
              <div className="dropdown-divider"></div>
              <button
                onClick={() => {
                  setCondFormatOpen(true);
                  setActiveMenu(null);
                }}
              >
                🎨 Bedingte Formatierung...
              </button>
              <button
                onClick={() => {
                  clearConditionalFormatting();
                  setActiveMenu(null);
                }}
              >
                ❌ Bedingte Formatierung entfernen
              </button>
            </div>
          )}
        </div>

        <div className="ribbon-divider" />

        {/* INSERT MENU */}
        <div style={{ position: "relative" }}>
          <button
            className={`nav-btn ${activeMenu === "insert" ? "active" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              setActiveMenu(activeMenu === "insert" ? null : "insert");
            }}
          >
            Einfügen
          </button>
          {activeMenu === "insert" && (
            <div className="dropdown-menu">
              <button
                onClick={() => {
                  insertRowAt();
                  setActiveMenu(null);
                }}
              >
                ↕ Zeile einfügen (oberhalb)
              </button>
              <button
                onClick={() => {
                  insertColAt();
                  setActiveMenu(null);
                }}
              >
                ↔ Spalte einfügen (links)
              </button>
              <div className="dropdown-divider"></div>
              <button
                onClick={() => {
                  deleteRowAt();
                  setActiveMenu(null);
                }}
                style={{ color: "#ef4444" }}
              >
                ✕ Zeile löschen
              </button>
              <button
                onClick={() => {
                  deleteColAt();
                  setActiveMenu(null);
                }}
                style={{ color: "#ef4444" }}
              >
                ✕ Spalte löschen
              </button>
              <div className="dropdown-divider"></div>
              <button
                onClick={() => {
                  addRow();
                  setActiveMenu(null);
                }}
              >
                Zeile unten anfügen
              </button>
              <button
                onClick={() => {
                  addCol();
                  setActiveMenu(null);
                }}
              >
                Spalte rechts anfügen
              </button>
              <div className="dropdown-divider"></div>
              <button
                onClick={() => {
                  setAiGenerateOpen(true);
                  setActiveMenu(null);
                }}
              >
                <Sparkles size={14} color="#38bdf8" /> KI: Tabelle erstellen...
              </button>
              <div className="dropdown-divider"></div>
              <button
                onClick={() => {
                  mergeCells();
                  setActiveMenu(null);
                }}
                disabled={!selection.start || !selection.end || (selection.start.r === selection.end.r && selection.start.c === selection.end.c)}
              >
                ⊞ Zellen zusammenführen
              </button>
              <button
                onClick={() => {
                  unmergeCells();
                  setActiveMenu(null);
                }}
              >
                ⊟ Zusammenführung aufheben
              </button>
              <div className="dropdown-divider"></div>
              <button
                onClick={() => {
                  addCellComment();
                  setActiveMenu(null);
                }}
              >
                💬 Kommentar hinzufügen
              </button>
            </div>
          )}
        </div>

        {/* DATA MENU (AI-Powered) */}
        <div style={{ position: "relative" }}>
          <button
            className={`nav-btn ${activeMenu === "data" ? "active" : ""} `}
            onClick={(e) => {
              e.stopPropagation();
              setActiveMenu(activeMenu === "data" ? null : "data");
            }}
          >
            Daten ✨
          </button>
          {activeMenu === "data" && (
            <div className="dropdown-menu">
              <button
                onClick={() => handleOpenAiPrompt("Pivot Tabelle erstellen")}
              >
                Pivot Tabelle...
              </button>
              <button
                onClick={() =>
                  handleOpenAiPrompt("Daten sortieren & filtern")
                }
              >
                Sortieren & Filtern...
              </button>
              <button
                onClick={() =>
                  handleOpenAiPrompt("Text in Spalten aufteilen")
                }
              >
                Text in Spalten...
              </button>
              <button
                onClick={() => handleOpenAiPrompt("Duplikate entfernen")}
              >
                Duplikate entfernen...
              </button>
              <button
                onClick={() =>
                  handleOpenAiPrompt("Datenüberprüfung (Validation)")
                }
              >
                Datenüberprüfung...
              </button>
            </div>
          )}
        </div>

        {/* VIEW MENU */}
        <div style={{ position: "relative" }}>
          <button
            className={`nav-btn ${activeMenu === "view" ? "active" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              setActiveMenu(activeMenu === "view" ? null : "view");
            }}
          >
            Ansicht
          </button>
          {activeMenu === "view" && (
            <div className="dropdown-menu">
              <button
                onClick={() => {
                  setShowChart(!showChart);
                  setActiveMenu(null);
                }}
                style={{
                  background: showChart ? "rgba(99, 102, 241, 0.2)" : "",
                }}
              >
                {showChart ? "✓ Chart anzeigen" : "Chart anzeigen"}
              </button>
              <div className="dropdown-divider"></div>
              <button
                onClick={() => {
                  freezePanes();
                  setActiveMenu(null);
                }}
              >
                ❄️ Fenster fixieren
              </button>
              <button
                onClick={() => {
                  unfreezePanes();
                  setActiveMenu(null);
                }}
                disabled={!currentSheet.frozenRows && !currentSheet.frozenCols}
              >
                Fixierung aufheben
              </button>
              {(currentSheet.frozenRows || currentSheet.frozenCols) && (
                <span style={{ padding: "0.3rem 0.8rem", fontSize: "0.75rem", color: "#64748b" }}>
                  Fixiert: {currentSheet.frozenRows || 0} Zeilen, {currentSheet.frozenCols || 0} Spalten
                </span>
              )}
            </div>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
            {saveStatus}
          </span>
        </div>
      </div>

      {/* Formula Bar */}
      <div className="formula-bar">
        <div className="cell-address" title="Aktive Zelle / Ausgewählter Bereich">
          {selection.start && selection.end
             // If start != end, show range A1:B2, else just A1
            ? (selection.start.r !== selection.end.r || selection.start.c !== selection.end.c)
                ? `${String.fromCharCode(65 + Math.min(selection.start.c, selection.end.c))}${Math.min(selection.start.r, selection.end.r) + 1}:${String.fromCharCode(65 + Math.max(selection.start.c, selection.end.c))}${Math.max(selection.start.r, selection.end.r) + 1}`
                : `${String.fromCharCode(65 + selection.start.c)}${selection.start.r + 1}`
            : ""}
        </div>
        {/* fx Symbol wie in Excel */}
        <div className="formula-icon" style={{ 
          fontWeight: "bold", 
          fontStyle: "italic", 
          color: "#64748b",
          fontSize: "0.9rem",
          padding: "0 0.3rem",
          borderRight: "1px solid var(--glass-border)",
          marginRight: "0.3rem"
        }}>
          <span title="Formel">fx</span>
        </div>
        <div className="formula-icon" style={{ position: "relative" }}>
          <button
            className="nav-btn"
            style={{ padding: "0.2rem", height: "auto" }}
            onClick={() => setShowFormulaSuggestions(!showFormulaSuggestions)}
            title="Formel-Vorschläge"
          >
            <Calculator size={16} />
          </button>

          {showFormulaSuggestions && (() => {
            const applyQuickFormula = (formulaPrefix: string) => {
              setShowFormulaSuggestions(false);

              // Helper to generate the A1 notation
              const getCellStr = (r: number, c: number) => `${String.fromCharCode(65 + c)}${r + 1}`;

              // If multiple cells are selected, automatically apply the formula to the active cell!
              if (selection.start && selection.end &&
                (selection.start.r !== selection.end.r || selection.start.c !== selection.end.c)) {

                const startStr = getCellStr(Math.min(selection.start.r, selection.end.r), Math.min(selection.start.c, selection.end.c));
                const endStr = getCellStr(Math.max(selection.start.r, selection.end.r), Math.max(selection.start.c, selection.end.c));

                const finalFormula = `${formulaPrefix}${startStr}:${endStr})`;
                setFormulaInput(finalFormula);
                handleCellChange(selection.start.r, selection.start.c, finalFormula);
              } else {
                // Standard behavior (just single cell selected), acts like a typer
                setFormulaInput(formulaPrefix);
                setTimeout(() => {
                  document.querySelector<HTMLInputElement>(".formula-input")?.focus();
                }, 50);
              }
            };

            return (
              <div className="dropdown-menu" style={{
                position: "absolute",
                top: "100%",
                left: 0,
                marginTop: "0.5rem",
                zIndex: 100
              }}>
                <button onClick={() => applyQuickFormula("=SUM(")}>SUM() - Summe</button>
                <button onClick={() => applyQuickFormula("=AVERAGE(")}>AVERAGE() - Mittelwert</button>
                <button onClick={() => applyQuickFormula("=MAX(")}>MAX() - Maximum</button>
                <button onClick={() => applyQuickFormula("=MIN(")}>MIN() - Minimum</button>
                <button onClick={() => applyQuickFormula("=COUNT(")}>COUNT() - Anzahl</button>
                <button onClick={() => applyQuickFormula("=IF(")}>IF() - Wenn-Dann</button>
              </div>
            );
          })()}
        </div>
        <input
          type="text"
          className="formula-input"
          value={formulaInput}
          onFocus={() => setIsEditingFormula(true)}
          onBlur={() => {
            // Delay disabling to allow cell clicks to register first
            setTimeout(() => setIsEditingFormula(false), 200);
          }}
          onChange={(e) => {
            setFormulaInput(e.target.value);
            if (selection.start) {
              handleCellChange(selection.start.r, selection.start.c, e.target.value);
            }
          }}
          onKeyDown={(e) => {
            // Enter = Confirm and move down
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (selection.start) {
                const newR = Math.min(selection.start.r + 1, rows - 1);
                const newSel = { start: { r: newR, c: selection.start.c }, end: { r: newR, c: selection.start.c } };
                setSelection(newSel);
                selectionRef.current = newSel;
                setFormulaInput(data[newR]?.[selection.start.c] || "");
              }
            }
            // Tab = Confirm and move right
            if (e.key === "Tab") {
              e.preventDefault();
              if (selection.start) {
                const newC = Math.min(selection.start.c + 1, cols - 1);
                const newSel = { start: { r: selection.start.r, c: newC }, end: { r: selection.start.r, c: newC } };
                setSelection(newSel);
                selectionRef.current = newSel;
                setFormulaInput(data[selection.start.r]?.[newC] || "");
              }
            }
            // Escape = Cancel editing, revert to original value
            if (e.key === "Escape") {
              if (selection.start) {
                const original = data[selection.start.r]?.[selection.start.c] || "";
                setFormulaInput(original);
              }
              (e.target as HTMLInputElement).blur();
            }
          }}
          placeholder="Formel oder Wert eingeben... (= für Formel, z.B. =SUM(A1:A10))"
          style={{
            borderColor: (selection.start && computedData[selection.start.r]?.[selection.start.c]?.toString().startsWith("#"))
              ? "#ef4444" 
              : undefined,
            boxShadow: (selection.start && computedData[selection.start.r]?.[selection.start.c]?.toString().startsWith("#"))
              ? "0 0 0 2px rgba(239,68,68,0.3)"
              : undefined
          }}
        />
        {/* Error indicator */}
        {selection.start && computedData[selection.start.r]?.[selection.start.c]?.toString().startsWith("#") && (
          <div style={{ 
            color: "#ef4444", 
            fontSize: "0.75rem", 
            display: "flex", 
            alignItems: "center", 
            gap: "0.25rem",
            padding: "0 0.5rem",
            background: "rgba(239,68,68,0.1)",
            borderRadius: "4px"
          }}>
            ⚠️ {computedData[selection.start.r]?.[selection.start.c]}
          </div>
        )}
      </div>

      {
        showChart && chartData.length > 0 && (
          <div
            style={{
              height: "300px",
              width: "100%",
              marginBottom: "1rem",
              background: "var(--glass-bg)",
              border: "var(--glass-border)",
              borderRadius: "12px",
              padding: "1rem",
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.1)"
                />
                <XAxis
                  dataKey="name"
                  stroke="#cbd5e1"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#cbd5e1"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "#1e293b",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                  itemStyle={{ color: "#fff" }}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )
      }

      {
        showChart && chartData.length === 0 && (
          <div
            style={{
              padding: "1rem",
              marginBottom: "1rem",
              background: "rgba(255,255,255,0.05)",
              borderRadius: "8px",
              color: "#94a3b8",
              fontSize: "0.9rem",
              textAlign: "center",
            }}
          >
            Enter labels in Row 1 and numbers in Row 2 to see the chart.
          </div>
        )
      }

      <div
        style={{
          padding: "0.75rem",
          marginBottom: "1rem",
          background: "rgba(56, 189, 248, 0.1)",
          border: "1px solid rgba(56, 189, 248, 0.2)",
          borderRadius: "8px",
          display: "flex",
          gap: "0.5rem",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: "1.2rem" }}>✨</span>
        <input
          type="text"
          placeholder="Ask AI: e.g. 'Addiere Spalte B und C, wenn A Bezahlt ist'"
          value={nlpQuery}
          onChange={(e) => setNlpQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleGenerateFormula()}
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            color: "#e2e8f0",
            outline: "none",
            fontSize: "0.9rem",
          }}
        />
        <button
          onClick={handleGenerateFormula}
          disabled={isGeneratingFormula || !selection.start}
          className="nav-btn"
          style={{
            background: "#0284c7",
            color: "#fff",
            fontSize: "0.8rem",
            padding: "0.3rem 0.75rem",
            opacity: !selection.start ? 0.5 : 1,
          }}
        >
          {isGeneratingFormula ? "Generating..." : "Insert Formula"}
        </button>
      </div>

      {/* Grid Container - single horizontal scroll context */}
      <div
        ref={gridScrollRef}
        className="grid-scroll-area"
        style={{ height: "calc(100vh - 320px)", width: "100%", overflowX: "auto", overflowY: "hidden", position: "relative", marginTop: "10px", userSelect: isDragging ? "none" : "auto" }}
      >
        {/* Fixed-width inner container */}
        <div style={{ width: `${40 + colWidths.reduce((a, b) => a + b, 0)}px`, display: "flex", flexDirection: "column", height: "100%" }}>
          {/* Column Headers */}
          <div style={{ display: "flex", flexShrink: 0, background: "var(--grid-row-header-bg)" }}>
            <div className="row-header" style={{ width: "40px", minWidth: "40px", height: "28px", borderRight: "1px solid var(--grid-border)", borderBottom: "1px solid var(--grid-border)", background: "var(--grid-row-header-bg)" }} />
            {Array.from({ length: cols }).map((_, i) => (
              <div
                key={i}
                data-col-header={i}
                className="col-header"
                onMouseDown={() => {
                  const newSel = { start: { r: 0, c: i }, end: { r: rows - 1, c: i } };
                  setIsDragging(true);
                  isDraggingRef.current = true;
                  isDraggingHeaderRef.current = "col";
                  setSelection(newSel);
                  selectionRef.current = newSel;
                }}
                style={{
                  position: "relative",
                  width: colWidths[i],
                  minWidth: colWidths[i],
                  height: "28px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "var(--grid-header-bg)",
                  borderRight: "1px solid var(--grid-border)",
                  borderBottom: "1px solid var(--grid-border)",
                  color: "var(--grid-header-text)",
                  fontSize: "0.75rem",
                  fontWeight: "600",
                  cursor: "s-resize",
                  userSelect: "none"
                }}
              >
                {i < 26 ? String.fromCharCode(65 + i) : String.fromCharCode(64 + Math.floor(i / 26)) + String.fromCharCode(65 + (i % 26))}
                <div
                  className="col-resizer"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    setResizing({
                      type: "col",
                      index: i,
                      startPos: e.pageX,
                      startSize: colWidths[i],
                    });
                  }}
                  style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "4px", cursor: "col-resize", zIndex: 5 }}
                />
              </div>
            ))}
          </div>

          {/* Virtualized Data Rows */}
          <FixedSizeList
            height={Math.max(200, (gridScrollRef.current?.clientHeight || window.innerHeight - 350) - 28)}
            itemCount={rows}
            itemSize={30}
            width={40 + colWidths.reduce((a, b) => a + b, 0)}
            style={{ overflow: "hidden auto" }}
            itemData={{
              selection,
              isDragging,
              isDraggingHeader: isDraggingHeaderRef.current,
              data,
              cellStyles,
              isFilling,
              fillEnd,
              computedData,
              formulaInput
            }}
          >
            {({ index: rIndex, style }: { index: number; style: React.CSSProperties }) => (
              <div style={{ ...style, display: "flex" }}>
                <div
                  data-row-header={rIndex}
                  className="row-header"
                  onMouseDown={() => {
                    const newSel = { start: { r: rIndex, c: 0 }, end: { r: rIndex, c: cols - 1 } };
                    setIsDragging(true);
                    isDraggingRef.current = true;
                    isDraggingHeaderRef.current = "row";
                    setSelection(newSel);
                    selectionRef.current = newSel;
                  }}
                  style={{
                    position: "sticky",
                    left: 0,
                    width: "40px",
                    minWidth: "40px",
                    height: "30px",
                    background: "var(--grid-row-header-bg)",
                    borderRight: "1px solid var(--grid-row-header-border)",
                    borderBottom: "1px solid var(--grid-row-header-border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--grid-header-text)",
                    fontSize: "0.75rem",
                    zIndex: 2,
                    cursor: "e-resize",
                    userSelect: "none"
                  }}
                >
                  {rIndex + 1}
                  <div
                    className="row-resizer"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      setResizing({
                        type: "row",
                        index: rIndex,
                        startPos: e.pageY,
                        startSize: rowHeights[rIndex] || 30,
                      });
                    }}
                    style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "4px", cursor: "row-resize", zIndex: 5 }}
                  />
                </div>
                {(data[rIndex] || []).map((cell, cIndex) => {
                  // Check if this cell is a slave in a merged region (hidden)
                  const mergedSlave = isMergedSlave(rIndex, cIndex);
                  if (mergedSlave) {
                    // Don't render slave cells at all
                    return null;
                  }
                  
                  // Check if this cell is a merge anchor
                  const mergeInfo = getMergeInfo(rIndex, cIndex);
                  const mergeColSpan = mergeInfo ? (mergeInfo.endCol - mergeInfo.startCol + 1) : 1;
                  const mergeRowSpan = mergeInfo ? (mergeInfo.endRow - mergeInfo.startRow + 1) : 1;
                  const mergedWidth = mergeInfo 
                    ? colWidths.slice(cIndex, cIndex + mergeColSpan).reduce((a, b) => a + b, 0) 
                    : colWidths[cIndex];
                  const baseRowHeight = rowHeights[rIndex] || 30;
                  const mergedHeight = mergeInfo
                    ? rowHeights.slice(rIndex, rIndex + mergeRowSpan).reduce((a, b) => a + b, 0)
                    : baseRowHeight;
                  
                  const isSelected =
                    selection.start &&
                    selection.end &&
                    rIndex >= Math.min(selection.start.r, selection.end.r) &&
                    rIndex <= Math.max(selection.start.r, selection.end.r) &&
                    cIndex >= Math.min(selection.start.c, selection.end.c) &&
                    cIndex <= Math.max(selection.start.c, selection.end.c);

                  const isActive = selection.start?.r === rIndex && selection.start?.c === cIndex;

                  const computedVal = computedData[rIndex]?.[cIndex];
                  let cellStyle = cellStyles[`${rIndex}-${cIndex}`] || {};
                  
                  // Apply conditional formatting
                  cellStyle = applyConditionalFormatting(rIndex, cIndex, computedVal, cellStyle);
                  
                  const displayValue = isActive ? cell : formatCellValue(computedVal, cellStyle.numberFormat);

                  let isInFillRange = false;
                  if (isFilling && selection.end && fillEnd) {
                    const fr = Math.min(selection.end.r, fillEnd.r);
                    const tr = Math.max(selection.end.r, fillEnd.r);
                    const fc = Math.min(selection.end.c, fillEnd.c);
                    const tc = Math.max(selection.end.c, fillEnd.c);
                    isInFillRange = rIndex >= fr && rIndex <= tr && cIndex >= fc && cIndex <= tc;
                  }

                  const isError = displayValue === "#ERROR" || (typeof displayValue === "string" && displayValue.startsWith("#"));
                  const hasComment = !!cellStyle.comment;

                  let textColor = cellStyle.color || "var(--grid-cell-text)";
                  if (cellStyle.autoColor) {
                    const numVal = typeof computedVal === "number" ? computedVal : Number(computedVal);
                    if (!isNaN(numVal) && computedVal !== "") {
                      if (numVal > 0) textColor = "#22c55e";
                      else if (numVal < 0) textColor = "#ef4444";
                      else textColor = "#f8fafc";
                    } else {
                      textColor = "#94a3b8";
                    }
                  }

                  return (
                    <div
                      key={cIndex}
                      id={`cell-${rIndex}-${cIndex}`}
                      data-row={rIndex}
                      data-col={cIndex}
                      className={`grid-cell ${isSelected ? "selected" : ""} ${isActive ? "active" : ""} ${isInFillRange ? "in-fill-range" : ""}`}
                      title={hasComment ? cellStyle.comment : undefined}
                      style={{
                        width: mergedWidth,
                        minWidth: mergedWidth,
                        height: mergedHeight,
                        textAlign: cellStyle.align || "left",
                        fontWeight: cellStyle.bold ? "bold" : "normal",
                        fontStyle: cellStyle.italic ? "italic" : "normal",
                        textDecoration: cellStyle.underline ? "underline" : "none",
                        backgroundColor: cellStyle.bgColor || "transparent",
                        borderTop: cellStyle.borders?.top ? "1px solid #94a3b8" : "none",
                        borderLeft: cellStyle.borders?.left ? "1px solid #94a3b8" : "none",
                        borderRight: cellStyle.borders?.right ? "1px solid #94a3b8" : "1px solid var(--grid-border)",
                        borderBottom: cellStyle.borders?.bottom ? "1px solid #94a3b8" : "1px solid var(--grid-border)",
                        display: "flex",
                        alignItems: "center",
                        fontSize: "0.85rem",
                        position: "relative",
                        userSelect: "none",
                        zIndex: mergeInfo ? 1 : "auto", // Merged cells on top
                      }}
                      onMouseDown={(e) => {
                        // Prevent default to stop text selection cursor issues
                        e.preventDefault();

                        if (e.shiftKey && selection.start) {
                          const newSel = { start: selection.start, end: { r: rIndex, c: cIndex } };
                          setSelection(newSel);
                          selectionRef.current = newSel;
                          setIsDragging(true);
                          isDraggingRef.current = true;
                          return;
                        }

                        // Check if we're editing a formula and should insert a cell reference
                        // This works after =, (, +, -, *, /, ,, !, or at end of sheet reference like "Tabelle2!"
                        const shouldInsertRef = isEditingFormula && formulaInput.startsWith("=") && 
                          /[=(\+\-\*\/,!]$/.test(formulaInput);
                        
                        if (shouldInsertRef) {
                          setFormulaDragStart({ r: rIndex, c: cIndex });
                          setFormulaDragging(true);
                          const colLetter = String.fromCharCode(65 + cIndex);
                          const rowNum = rIndex + 1;
                          
                          // If we're on a different sheet and the formula doesn't already have the sheet prefix
                          let cellRef = `${colLetter}${rowNum}`;
                          if (formulaOriginSheet && formulaOriginSheet.sheetIndex !== activeSheetIndex) {
                            const currentSheetName = sheets[activeSheetIndex]?.name || "";
                            // Only add sheet prefix if it's not already there
                            if (!formulaInput.endsWith(currentSheetName + "!")) {
                              cellRef = `${currentSheetName}!${colLetter}${rowNum}`;
                            }
                          }
                          
                          const newFormulaInput = formulaInput + cellRef;
                          setFormulaInput(newFormulaInput);
                          if (formulaOriginSheet) {
                            // Update the formula in the original cell
                            const origSheet = sheets[formulaOriginSheet.sheetIndex];
                            if (origSheet) {
                              const newData = origSheet.data.map((row, ri) => 
                                row.map((cell, ci) => 
                                  ri === formulaOriginSheet.r && ci === formulaOriginSheet.c ? newFormulaInput : cell
                                )
                              );
                              setSheets(prev => prev.map((s, i) => i === formulaOriginSheet.sheetIndex ? { ...s, data: newData } : s));
                            }
                          } else if (selection.start) {
                            handleCellChange(selection.start.r, selection.start.c, newFormulaInput);
                          }
                          return;
                        }

                        // Normal cell click & drag start
                        // If we were editing a formula on another sheet, go back
                        if (formulaOriginSheet && formulaOriginSheet.sheetIndex !== activeSheetIndex) {
                          setActiveSheetIndex(formulaOriginSheet.sheetIndex);
                          setFormulaOriginSheet(null);
                          setIsEditingFormula(false);
                          return;
                        }
                        
                        setFormulaOriginSheet(null);
                        setIsDragging(true);
                        isDraggingRef.current = true;
                        isDraggingHeaderRef.current = null;
                        const newSel = { start: { r: rIndex, c: cIndex }, end: { r: rIndex, c: cIndex } };
                        setSelection(newSel);
                        selectionRef.current = newSel;

                        // Update formula bar to show cell content
                        setFormulaInput(cell || "");
                      }}
                      onMouseEnter={() => {
                        if (formulaDragging && formulaDragStart && isEditingFormula && selectionRef.current.start) {
                          const startCol = String.fromCharCode(65 + formulaDragStart.c);
                          const startRow = formulaDragStart.r + 1;
                          const endCol = String.fromCharCode(65 + cIndex);
                          const endRow = rIndex + 1;
                          const baseFormula = formulaInput.replace(/[A-Z]+\d+(:[A-Z]+\d+)?$/, "");
                          const rangeStr = (formulaDragStart.r === rIndex && formulaDragStart.c === cIndex)
                            ? `${startCol}${startRow}`
                            : `${startCol}${startRow}:${endCol}${endRow}`;
                          const newFormulaInput = baseFormula + rangeStr;
                          setFormulaInput(newFormulaInput);
                          handleCellChange(selectionRef.current.start!.r, selectionRef.current.start!.c, newFormulaInput);
                          return;
                        }
                        // This serves as a quick hover-drag fallback for fast mouse movements
                        if (isDraggingRef.current && selectionRef.current.start) {
                          const newSel = { start: selectionRef.current.start, end: { r: rIndex, c: cIndex } };
                          setSelection(newSel);
                          selectionRef.current = newSel;
                        } else if (isFillingRef.current && selectionRef.current.end) {
                          setFillEnd({ r: rIndex, c: cIndex });
                          fillEndRef.current = { r: rIndex, c: cIndex };
                        }
                      }}
                    >
                      <input
                        id={`cell-input-${rIndex}-${cIndex}`}
                        type="text"
                        value={displayValue || ""}
                        autoFocus={isActive}
                        onFocus={(e) => {
                          setFormulaInput(cell || "");
                          // Move cursor to end to prevent jumping to start on re-render
                          const len = e.target.value.length;
                          e.target.setSelectionRange(len, len);
                        }}
                        onChange={(e) => handleCellChange(rIndex, cIndex, e.target.value)}
                        onMouseDown={(e) => {
                           // Allow clicking into the input if it's already active
                           if (isActive) {
                             e.stopPropagation();
                           } else {
                             if (isDraggingRef.current) e.preventDefault();
                           }
                        }}
                        style={{
                          color: isError ? "#ef4444" : textColor,
                          background: "transparent",
                          fontWeight: "inherit",
                          fontStyle: "inherit",
                          textDecoration: "inherit",
                          pointerEvents: isDragging ? "none" : (isActive ? "auto" : "none"),
                          width: "100%",
                          height: "100%",
                          border: "none",
                          outline: "none",
                          cursor: "cell",
                          paddingLeft: "4px"
                        }}
                      />
                      {/* Comment indicator */}
                      {hasComment && (
                        <div
                          style={{
                            position: "absolute",
                            top: 0,
                            right: 0,
                            width: 0,
                            height: 0,
                            borderLeft: "6px solid transparent",
                            borderTop: "6px solid #ef4444",
                            pointerEvents: "none"
                          }}
                        />
                      )}
                      {isActive && !isDragging && (
                        <div
                          className="fill-handle"
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            setIsFilling(true);
                            setFillEnd({ r: rIndex, c: cIndex });
                          }}
                          style={{ position: "absolute", right: "-4px", bottom: "-4px", width: "8px", height: "8px", background: "#3b82f6", cursor: "crosshair", zIndex: 10, border: "1px solid white" }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </FixedSizeList>
        </div>
      </div>

      {/* Sheet Tabs */}
      <div className="sheet-tabs" style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1rem", background: "rgba(15, 23, 42, 0.95)", borderTop: "1px solid var(--glass-border)", position: "relative", height: "40px", zIndex: 20, flexShrink: 0 }}>
        {sheets.map((sheet, index) => (
          <button
            key={sheet.id}
            className={`sheet-tab ${index === activeSheetIndex ? "active" : ""}`}
            onClick={() => {
              if (isEditingFormula && selection.start && index !== activeSheetIndex) {
                if (!formulaOriginSheet) {
                  setFormulaOriginSheet({ sheetIndex: activeSheetIndex, r: selection.start.r, c: selection.start.c });
                }
                const sheetPrefix = sheet.name + "!";
                setFormulaInput(formulaInput + sheetPrefix);
                setActiveSheetIndex(index);
              } else {
                setActiveSheetIndex(index);
              }
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              setSheetContextMenu({ x: e.clientX, y: e.clientY, index });
            }}
            style={{
              background: "transparent",
              border: "none",
              color: index === activeSheetIndex ? "var(--primary-color)" : "#94a3b8",
              padding: "0.4rem 1rem",
              cursor: "pointer",
              fontSize: "0.85rem",
              borderBottom: index === activeSheetIndex ? "2px solid var(--primary-color)" : "2px solid transparent",
              fontWeight: index === activeSheetIndex ? "600" : "400"
            }}
          >
            {sheet.name}
          </button>
        ))}
        <button onClick={addSheet} style={{ background: "transparent", border: "none", color: "#64748b", cursor: "pointer", fontSize: "1.2rem", padding: "0 0.5rem" }}>+</button>
        
        {/* Status Bar – Selection Stats */}
        <div style={{ marginLeft: "auto", display: "flex", gap: "1rem", alignItems: "center", fontSize: "0.8rem", color: "#94a3b8" }}>
          {selectionStats && (
            <>
              {selectionStats.sum !== undefined && <span>Σ Summe: <strong style={{ color: "var(--primary-color)" }}>{selectionStats.sum.toLocaleString("de-DE")}</strong></span>}
              {selectionStats.average !== undefined && <span>⌀ Durchschnitt: <strong style={{ color: "var(--primary-color)" }}>{selectionStats.average.toLocaleString("de-DE")}</strong></span>}
              {selectionStats.min !== undefined && <span>↓ Min: <strong>{selectionStats.min.toLocaleString("de-DE")}</strong></span>}
              {selectionStats.max !== undefined && <span>↑ Max: <strong>{selectionStats.max.toLocaleString("de-DE")}</strong></span>}
              <span>Anzahl: <strong>{selectionStats.count}</strong></span>
            </>
          )}
          <span style={{ color: "#475569" }}>{saveStatus}</span>
        </div>
      </div>

      {/* Sheet Tab Context Menu */}
      {
        sheetContextMenu && (
          <div
            className="dropdown-menu"
            style={{ position: "fixed", top: sheetContextMenu!.y, left: sheetContextMenu!.x, zIndex: 1000, minWidth: "160px" }}
            onClick={() => setSheetContextMenu(null)}
          >
            <button onClick={() => renameSheet(sheetContextMenu!.index)}>✏️ Umbenennen</button>
            <div className="dropdown-divider"></div>
            <button onClick={() => deleteSheet(sheetContextMenu!.index)} style={{ color: "#ef4444" }}>🗑️ Löschen</button>
          </div>
        )
      }

      {/* Find & Replace Dialog */}
      {findReplaceOpen && (
        <div style={{
          position: "fixed", top: "80px", right: "20px", zIndex: 2000,
          background: "var(--glass-bg)", backdropFilter: "blur(20px)",
          border: "1px solid var(--glass-border)", borderRadius: "12px",
          padding: "1rem", minWidth: "340px", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>🔍 Suchen & Ersetzen</span>
            <button onClick={() => { setFindReplaceOpen(false); setFindResults([]); }} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "1.2rem" }}>✕</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <input
                autoFocus
                type="text"
                placeholder="Suchen..."
                value={findText}
                onChange={(e) => { setFindText(e.target.value); handleFind(e.target.value); }}
                onKeyDown={(e) => { if (e.key === "Enter") { e.shiftKey ? handleFindPrev() : handleFindNext(); } if (e.key === "Escape") { setFindReplaceOpen(false); setFindResults([]); } }}
                style={{ flex: 1, padding: "0.5rem", borderRadius: "6px", border: "1px solid var(--glass-border)", background: "rgba(15,23,42,0.5)", color: "inherit", fontSize: "0.85rem" }}
              />
              <span style={{ fontSize: "0.75rem", color: "#64748b", whiteSpace: "nowrap" }}>
                {findResults.length > 0 ? `${findIndex + 1}/${findResults.length}` : "0/0"}
              </span>
            </div>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <input
                type="text"
                placeholder="Ersetzen mit..."
                value={replaceText}
                onChange={(e) => setReplaceText(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleReplace(); if (e.key === "Escape") { setFindReplaceOpen(false); setFindResults([]); } }}
                style={{ flex: 1, padding: "0.5rem", borderRadius: "6px", border: "1px solid var(--glass-border)", background: "rgba(15,23,42,0.5)", color: "inherit", fontSize: "0.85rem" }}
              />
            </div>
            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
              <button onClick={handleFindPrev} className="ribbon-btn" title="Vorheriges" style={{ fontSize: "0.8rem", padding: "0.3rem 0.6rem" }}>◀</button>
              <button onClick={handleFindNext} className="ribbon-btn" title="Nächstes" style={{ fontSize: "0.8rem", padding: "0.3rem 0.6rem" }}>▶</button>
              <button onClick={handleReplace} className="ribbon-btn" title="Ersetzen" style={{ fontSize: "0.8rem", padding: "0.3rem 0.6rem" }}>Ersetzen</button>
              <button onClick={handleReplaceAll} className="ribbon-btn" title="Alle ersetzen" style={{ fontSize: "0.8rem", padding: "0.3rem 0.6rem" }}>Alle</button>
            </div>
          </div>
        </div>
      )}

      {/* Conditional Formatting Dialog */}
      {condFormatOpen && (
        <div style={{
          position: "fixed", top: "80px", right: "380px", zIndex: 2000,
          background: "var(--glass-bg)", backdropFilter: "blur(20px)",
          border: "1px solid var(--glass-border)", borderRadius: "12px",
          padding: "1rem", minWidth: "300px", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>🎨 Bedingte Formatierung</span>
            <button onClick={() => setCondFormatOpen(false)} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "1.2rem" }}>✕</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div>
              <label style={{ fontSize: "0.75rem", color: "#94a3b8", display: "block", marginBottom: "0.25rem" }}>Regel-Typ</label>
              <select
                value={condFormatType}
                onChange={(e) => setCondFormatType(e.target.value as ConditionalRule["type"])}
                style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid var(--glass-border)", background: "rgba(15,23,42,0.8)", color: "inherit", fontSize: "0.85rem" }}
              >
                <option value="greaterThan">Größer als</option>
                <option value="lessThan">Kleiner als</option>
                <option value="equals">Gleich</option>
                <option value="between">Zwischen</option>
                <option value="text">Text enthält</option>
              </select>
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: "0.75rem", color: "#94a3b8", display: "block", marginBottom: "0.25rem" }}>Wert 1</label>
                <input
                  type="text"
                  value={condFormatValue1}
                  onChange={(e) => setCondFormatValue1(e.target.value)}
                  placeholder="z.B. 100"
                  style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid var(--glass-border)", background: "rgba(15,23,42,0.5)", color: "inherit", fontSize: "0.85rem", boxSizing: "border-box" }}
                />
              </div>
              {condFormatType === "between" && (
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: "0.75rem", color: "#94a3b8", display: "block", marginBottom: "0.25rem" }}>Wert 2</label>
                  <input
                    type="text"
                    value={condFormatValue2}
                    onChange={(e) => setCondFormatValue2(e.target.value)}
                    placeholder="z.B. 200"
                    style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid var(--glass-border)", background: "rgba(15,23,42,0.5)", color: "inherit", fontSize: "0.85rem", boxSizing: "border-box" }}
                  />
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: "0.75rem", color: "#94a3b8", display: "block", marginBottom: "0.25rem" }}>Textfarbe</label>
                <input
                  type="color"
                  value={condFormatColor}
                  onChange={(e) => setCondFormatColor(e.target.value)}
                  style={{ width: "100%", height: "32px", border: "none", borderRadius: "6px", cursor: "pointer" }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: "0.75rem", color: "#94a3b8", display: "block", marginBottom: "0.25rem" }}>Hintergrund</label>
                <input
                  type="color"
                  value={condFormatBgColor}
                  onChange={(e) => setCondFormatBgColor(e.target.value)}
                  style={{ width: "100%", height: "32px", border: "none", borderRadius: "6px", cursor: "pointer" }}
                />
              </div>
            </div>
            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", marginTop: "0.5rem" }}>
              <button onClick={() => setCondFormatOpen(false)} className="ribbon-btn" style={{ fontSize: "0.8rem", padding: "0.4rem 0.8rem" }}>Abbrechen</button>
              <button onClick={addConditionalRule} className="ribbon-btn" style={{ fontSize: "0.8rem", padding: "0.4rem 0.8rem", background: "#3b82f6" }}>Hinzufügen</button>
            </div>
          </div>
        </div>
      )}

      {/* Eliot AI Chat Integration */}
      <EliotChat
        contextData={getGridCSV()}
        contextType="spreadsheet"
      />

      {/* Hidden Print Container for ReactToPrint */}
      <div style={{ display: "none" }}>
        <div ref={printRef} style={{ padding: "2cm", color: "black", background: "white", fontFamily: "sans-serif" }}>
          <h1 style={{ textAlign: "center", marginBottom: "2rem" }}>{currentSheet.name}</h1>
          <table style={{ borderCollapse: "collapse", width: "100%", fontSize: "10pt" }}>
            <thead>
              <tr>
                {Array.from({ length: Math.min(cols, 26) }).map((_, c) => (
                  <th key={c} style={{ padding: "8px", fontWeight: "bold", borderBottom: "2px solid #333", textAlign: "left" }}>
                    {String.fromCharCode(65 + c)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, r) => {
                // Only print rows that actually have data to save paper
                if (!row.some(c => c !== "")) return null;
                return (
                  <tr key={r}>
                    {Array.from({ length: Math.min(cols, 26) }).map((_, c) => {
                      const style = cellStyles[`${r}-${c}`] || {};
                      const hasBorder = style.borders?.top || style.borders?.right || style.borders?.bottom || style.borders?.left;
                      return (
                        <td key={c} style={{
                          padding: "6px 8px",
                          textAlign: style.align || "left",
                          fontWeight: style.bold ? "bold" : "normal",
                          fontStyle: style.italic ? "italic" : "normal",
                          textDecoration: style.underline ? "underline" : "none",
                          backgroundColor: style.bgColor || "transparent",
                          color: style.color || "black",
                          borderTop: style.borders?.top ? "1px solid #333" : "none",
                          borderRight: style.borders?.right ? "1px solid #333" : "none",
                          borderBottom: style.borders?.bottom ? "1px solid #333" : (hasBorder ? "none" : "1px solid #e5e7eb"),
                          borderLeft: style.borders?.left ? "1px solid #333" : "none",
                        }}>
                          {computedData[r]?.[c] ?? row[c]}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Print Preview Modal */}
      <PrintPreviewModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        defaultOrientation="landscape"
        onPrint={() => {
          setIsPrintModalOpen(false);
          setTimeout(() => {
            handlePrintOuter();
          }, 100);
        }}
        previewContent={
          <div style={{ padding: "1rem", color: "black", background: "white", fontFamily: "sans-serif", overflowY: 'auto', maxHeight: '600px' }}>
            <h2 style={{ textAlign: "center", marginBottom: "1rem" }}>{currentSheet.name}</h2>
            <table style={{ borderCollapse: "collapse", width: "100%", fontSize: "8pt" }}>
              <thead>
                <tr>
                  {Array.from({ length: Math.min(cols, 10) }).map((_, c) => (
                    <th key={c} style={{ padding: "4px", fontWeight: "bold", borderBottom: "2px solid #333", textAlign: "left" }}>
                      {String.fromCharCode(65 + c)}
                    </th>
                  ))}
                  {cols > 10 && <th style={{ padding: "4px", fontWeight: "bold", borderBottom: "2px solid #333" }}>...</th>}
                </tr>
              </thead>
              <tbody>
                {data.filter(row => row.some(cell => cell !== "")).slice(0, 50).map((row, rIdx) => {
                  const actualR = data.indexOf(row);
                  return (
                    <tr key={rIdx}>
                      {Array.from({ length: Math.min(cols, 10) }).map((_, c) => {
                        const style = cellStyles[`${actualR}-${c}`] || {};
                        return (
                          <td key={c} style={{
                            padding: "4px",
                            textAlign: style.align || "left",
                            fontWeight: style.bold ? "bold" : "normal",
                            fontStyle: style.italic ? "italic" : "normal",
                            backgroundColor: style.bgColor || "transparent",
                            color: style.color || "black",
                            borderTop: style.borders?.top ? "1px solid #333" : "none",
                            borderRight: style.borders?.right ? "1px solid #333" : "none",
                            borderBottom: style.borders?.bottom ? "1px solid #333" : "none",
                            borderLeft: style.borders?.left ? "1px solid #333" : "none",
                          }}>
                            {computedData[actualR]?.[c] ?? row[c]}
                          </td>
                        );
                      })}
                      {cols > 10 && <td style={{ padding: "4px", color: "#999" }}>...</td>}
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {(data.filter(row => row.some(c => c !== "")).length > 50) && (
              <div style={{ textAlign: "center", marginTop: "10px", color: "#64748b", fontSize: '0.8rem' }}>
                (Vorschau zeigt nur die ersten 50 befüllten Zeilen)
              </div>
            )}
          </div>
        }
      />

      {/* Image Upload Modal */}
      <ImageUploadModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        showAlignment={false}
        onInsert={handleImageInsert}
      />

      {/* Draggable Images Overlay */}
      {
        currentSheet.images?.map((img) => (
          <div
            key={img.id}
            onMouseDown={(e) => handleImageMouseDown(e, img.id)}
            style={{
              position: "absolute",
              left: img.x,
              top: img.y + 120, // Offset for header/ribbon
              width: img.width,
              border: draggingImageId === img.id ? "2px solid #38bdf8" : "1px solid rgba(255,255,255,0.1)",
              background: "rgba(15, 23, 42, 0.4)",
              backdropFilter: "blur(4px)",
              borderRadius: "8px",
              overflow: "hidden",
              cursor: "move",
              zIndex: draggingImageId === img.id ? 1001 : 1000,
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)",
            }}
          >
            <img src={img.src} alt="Uploaded" style={{ width: "100%", display: "block" }} draggable={false} />
            {img.caption && (
              <div style={{ padding: "0.5rem", fontSize: "0.8rem", color: "#94a3b8", background: "rgba(15, 23, 42, 0.8)", fontStyle: "italic" }}>
                {img.caption}
              </div>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                updateCurrentSheet({ images: currentSheet.images?.filter(i => i.id !== img.id) });
              }}
              style={{ position: "absolute", top: "5px", right: "5px", background: "rgba(239, 68, 68, 0.8)", border: "none", color: "white", borderRadius: "50%", width: "20px", height: "20px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <X size={12} />
            </button>
          </div>
        ))
      }
      {/* Eliot AI Chat Integration */}
      <EliotChat
        contextData={getGridCSV()}
        contextType="spreadsheet"
        onAction={handleEliotAction}
      />
    </div >
  );
}
