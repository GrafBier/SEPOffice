/*
    SEPShow — Presentation editor and manager.

    English developer notes:

    - Purpose: Canvas-based slide editor using Konva to support free-form
        slide element placement, images, shapes and text blocks. Designed to be
        user-friendly for quick slide creation and AI-assisted layout.

    - Design decisions:
        * Use Konva (`SlideCanvas`) to get performant element transforms and
            interactions without heavy DOM reflows.
        * Maintain history snapshots (pushUndoSnapshot) at interaction boundaries
            rather than on every small change to avoid history bloat and improve
            responsiveness during drags.

    - Difficulties & solutions:
        * Challenge: clipboard image paste and file drops needed careful handling
            to convert binary image data to data URLs for the canvas. Solved by
            reading File/Clipboard items as data URLs and creating image elements
            through the same image insertion path used by the image modal.
        * Challenge: keeping speaker notes and slide data persistent while allowing
            reordering/duplication. Solution: serialize slides to JSON and store via
            `persistenceService` with debounced saves.
*/
import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
    Plus, Copy, Trash2, ChevronUp, ChevronDown, Play,
    Type, Image as ImageIcon, Square, Circle, ArrowRight,
    Layout, Sparkles, StickyNote, Wand2, MessageSquare,
    Loader2, Printer, Undo2, Redo2, Download
} from 'lucide-react';
import SlideCanvas, { CANVAS_WIDTH, CANVAS_HEIGHT } from './SlideCanvas';
import PresentationMode from './PresentationMode';
import type { SlideElement, Slide } from './SlideCanvas';
import { ImageUploadModal } from './ImageUploadModal';
import type { ImageDataPayload } from './ImageUploadModal';
import { SLIDE_LAYOUTS } from '../data/slideLayouts';
import type { LayoutElement } from '../data/slideLayouts';
import { persistenceService } from '../services/persistenceService';
import { useAISettings } from '../contexts/AISettingsContext';
import * as aiSvc from '../services/aiService';
import PptxGenJS from "pptxgenjs";
import { useTranslation } from "react-i18next";

// ── Helpers ───────────────────────────────────────────────────────────

let _idCounter = Date.now();
function uid(): string {
    return `el-${_idCounter++}`;
}

function layoutToSlideElements(layoutElements: LayoutElement[]): SlideElement[] {
    return layoutElements.map((le) => ({
        id: uid(),
        type: le.type,
        x: le.x, y: le.y,
        width: le.width, height: le.height,
        rotation: 0,
        text: le.text,
        fontSize: le.fontSize,
        fontFamily: le.fontFamily,
        fontStyle: le.fontStyle,
        fill: le.fill,
        align: (le.align === 'center' || le.align === 'right' || le.align === 'justify') ? le.align : 'left',
        shapeType: le.type === 'shape' ? 'rect' as const : undefined,
    }));
}

function createSlide(layoutId = 'blank'): Slide {
    const layout = SLIDE_LAYOUTS.find((l) => l.id === layoutId) || SLIDE_LAYOUTS[5];
    return {
        id: uid(),
        elements: layoutToSlideElements(layout.elements),
        background: layout.background,
        speakerNotes: '',
        layout: layoutId,
    };
}

// ── Prop Types ────────────────────────────────────────────────────────

interface SepShowProps {
    docId?: string | null;
}

// ── Component ─────────────────────────────────────────────────────────

const SepShow: React.FC<SepShowProps> = ({ docId }) => {
    const { t } = useTranslation();
    const { settings: aiSettings } = useAISettings();

    // ── State ───────────────────────────────────────────────────────────
    const [slides, setSlides] = useState<Slide[]>([createSlide('title')]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
    const [showLayoutPicker, setShowLayoutPicker] = useState(false);
    const [showImageModal, setShowImageModal] = useState(false);
    const [showNotesPanel, setShowNotesPanel] = useState(false);
    const [showPresentation, setShowPresentation] = useState(false);
    const [docName, setDocName] = useState('Unbenannte Präsentation');
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; slideIdx: number } | null>(null);
    const [currentDocId, setCurrentDocId] = useState<string | null>(docId || null);
    const [saveStatus, setSaveStatus] = useState('Änderungen gespeichert');
    const saveTimeoutRef = useRef<number | null>(null);
    const [draggedSlideIdx, setDraggedSlideIdx] = useState<number | null>(null);
    const persistenceSnapshotRef = useRef({ docName, slides });
    useEffect(() => {
        persistenceSnapshotRef.current = { docName, slides };
    }, [docName, slides]);

    // ── Undo / Redo (Roadmap B1) ──────────────────────────────────────
    const undoStackRef = useRef<Slide[][]>([]);
    const redoStackRef = useRef<Slide[][]>([]);
    const MAX_HISTORY = 50;

    const pushUndoSnapshot = useCallback(() => {
        undoStackRef.current.push(JSON.parse(JSON.stringify(slides)));
        if (undoStackRef.current.length > MAX_HISTORY) undoStackRef.current.shift();
        redoStackRef.current = [];
    }, [slides]);

    const handleImageInsert = useCallback((data: ImageDataPayload) => {
        pushUndoSnapshot();
        const el: SlideElement = {
            id: uid(), type: 'image',
            x: 200, y: 100, width: 300, height: 220, rotation: 0,
            src: data.src,
        };
        setSlides((prev) =>
            prev.map((s, i) => (i === activeIndex ? { ...s, elements: [...s.elements, el] } : s))
        );
        setSelectedElementId(el.id);
        setShowImageModal(false);
    }, [activeIndex, pushUndoSnapshot]);

    const handleUndo = useCallback(() => {
        const snap = undoStackRef.current.pop();
        if (!snap) return;
        redoStackRef.current.push(JSON.parse(JSON.stringify(slides)));
        setSlides(snap);
        setSelectedElementId(null);
    }, [slides]);

    const handleRedo = useCallback(() => {
        const snap = redoStackRef.current.pop();
        if (!snap) return;
        undoStackRef.current.push(JSON.parse(JSON.stringify(slides)));
        setSlides(snap);
        setSelectedElementId(null);
    }, [slides]);

    // ── Clipboard / Keyboard (Roadmap B2) ──────────────────────────────
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                handleUndo();
            } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
                e.preventDefault();
                handleRedo();
            }
        };

        const handlePaste = async (e: ClipboardEvent) => {
            // Only paste if we're not in an input/textarea
            if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;

            const items = e.clipboardData?.items;
            if (!items) return;

            for (const item of Array.from(items)) {
                if (item.type.startsWith('image/')) {
                    const file = item.getAsFile();
                    if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                            const src = event.target?.result as string;
                            pushUndoSnapshot();
                            handleImageInsert({ src, alignment: 'center', isGeneratingCaption: false });
                        };
                        reader.readAsDataURL(file);
                    }
                } else if (item.type === 'text/plain') {
                    item.getAsString((text) => {
                        pushUndoSnapshot();
                        const el: SlideElement = {
                            id: uid(), type: 'text',
                            x: 150, y: 150, width: 400, height: 100, rotation: 0,
                            text, fontSize: 24,
                            fontFamily: 'Inter, sans-serif', fontStyle: 'normal',
                            fill: '#e2e8f0', align: 'left',
                        };
                        setSlides((prev) =>
                            prev.map((s, i) => (i === activeIndex ? { ...s, elements: [...s.elements, el] } : s))
                        );
                        setSelectedElementId(el.id);
                    });
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('paste', handlePaste);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('paste', handlePaste);
        };
    }, [handleUndo, handleRedo, activeIndex, handleImageInsert, pushUndoSnapshot]);

    // Sync docId from props (Roadmap A1)
    React.useEffect(() => {
        if (docId && docId !== currentDocId) {
            setCurrentDocId(docId);
        }
    }, [docId, currentDocId]);

    // AI State
    const [showAIDialog, setShowAIDialog] = useState(false);
    const [aiTopic, setAiTopic] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const [showVibeMenu, setShowVibeMenu] = useState(false);

    const activeSlide = slides[activeIndex] || slides[0];

    // ── Persistence ─────────────────────────────────────────────────────

    React.useEffect(() => {
        if (!currentDocId) {
            const newId = `show-${Date.now()}`;
            setCurrentDocId(newId);
            const { docName: snapshotDocName, slides: snapshotSlides } = persistenceSnapshotRef.current;
            persistenceService.saveDoc(newId, snapshotDocName, 'show', JSON.stringify(snapshotSlides));
            return;
        }
        const meta = persistenceService.getRecentDocs().find(d => d.id === currentDocId);
        if (meta && meta.type !== 'show') {
            const newId = `show-${Date.now()}`;
            setCurrentDocId(newId);
            return;
        }
        const savedContent = persistenceService.getDocContent(currentDocId);
        if (savedContent) {
            try {
                const parsed = JSON.parse(savedContent);
                if (Array.isArray(parsed) && parsed.length > 0) setSlides(parsed);
                if (meta) setDocName(meta.name);
            } catch (e) { console.error('Failed to load show content', e); }
        }
    }, [currentDocId]);

    React.useEffect(() => {
        if (!currentDocId) return;
        if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current);
        setSaveStatus('Speichere...');
        saveTimeoutRef.current = window.setTimeout(() => {
            const result = persistenceService.saveDoc(currentDocId, docName, 'show', JSON.stringify(slides));
            setSaveStatus(result.warning || 'Alle Änderungen gespeichert');
        }, 1000) as unknown as number;
    }, [slides, currentDocId, docName]);

    // ── Slide Management ────────────────────────────────────────────────

    const addSlide = useCallback((layoutId = 'blank') => {
        pushUndoSnapshot();
        const newSlide = createSlide(layoutId);
        const newSlides = [...slides];
        newSlides.splice(activeIndex + 1, 0, newSlide);
        setSlides(newSlides);
        setActiveIndex(activeIndex + 1);
        setSelectedElementId(null);
        setShowLayoutPicker(false);
    }, [slides, activeIndex, pushUndoSnapshot]);

    const duplicateSlide = useCallback((idx: number) => {
        pushUndoSnapshot();
        const clone: Slide = JSON.parse(JSON.stringify(slides[idx]));
        clone.id = uid();
        clone.elements = clone.elements.map((e) => ({ ...e, id: uid() }));
        const newSlides = [...slides];
        newSlides.splice(idx + 1, 0, clone);
        setSlides(newSlides);
        setActiveIndex(idx + 1);
    }, [slides, pushUndoSnapshot]);

    const deleteSlide = useCallback((idx: number) => {
        if (slides.length <= 1) return;
        pushUndoSnapshot();
        const newSlides = slides.filter((_, i) => i !== idx);
        setSlides(newSlides);
        setActiveIndex(Math.min(idx, newSlides.length - 1));
        setSelectedElementId(null);
    }, [slides, pushUndoSnapshot]);

    const moveSlide = useCallback((idx: number, dir: -1 | 1) => {
        const target = idx + dir;
        if (target < 0 || target >= slides.length) return;
        pushUndoSnapshot();
        const newSlides = [...slides];
        [newSlides[idx], newSlides[target]] = [newSlides[target], newSlides[idx]];
        setSlides(newSlides);
        setActiveIndex(target);
    }, [slides, pushUndoSnapshot]);

    const reorderSlides = useCallback((fromIdx: number, toIdx: number) => {
        if (fromIdx === toIdx) return;
        pushUndoSnapshot();
        const newSlides = [...slides];
        const [moved] = newSlides.splice(fromIdx, 1);
        newSlides.splice(toIdx, 0, moved);
        setSlides(newSlides);
        setActiveIndex(toIdx);
    }, [slides, pushUndoSnapshot]);

    // ── Element Operations ──────────────────────────────────────────────

    const updateElement = useCallback((id: string, changes: Partial<SlideElement>) => {
        // We don't push history here because this is called during drag.
        // History should be pushed at the start of interaction.
        setSlides((prev) =>
            prev.map((s, i) =>
                i === activeIndex
                    ? { ...s, elements: s.elements.map((el) => (el.id === id ? { ...el, ...changes } : el)) }
                    : s
            )
        );
    }, [activeIndex]);

    const deleteElement = useCallback((id: string) => {
        pushUndoSnapshot();
        setSlides((prev) =>
            prev.map((s, i) =>
                i === activeIndex
                    ? { ...s, elements: s.elements.filter((el) => el.id !== id) }
                    : s
            )
        );
        setSelectedElementId(null);
    }, [activeIndex, pushUndoSnapshot]);

    const addTextbox = useCallback(() => {
        pushUndoSnapshot();
        const el: SlideElement = {
            id: uid(), type: 'text',
            x: 100, y: 200, width: 400, height: 60, rotation: 0,
            text: 'Text eingeben...', fontSize: 24,
            fontFamily: 'Inter, sans-serif', fontStyle: 'normal',
            fill: '#e2e8f0', align: 'left',
        };
        setSlides((prev) =>
            prev.map((s, i) => (i === activeIndex ? { ...s, elements: [...s.elements, el] } : s))
        );
        setSelectedElementId(el.id);
    }, [activeIndex, pushUndoSnapshot]);

    const addShape = useCallback((shapeType: 'rect' | 'circle' | 'arrow') => {
        pushUndoSnapshot();
        const el: SlideElement = {
            id: uid(), type: 'shape',
            x: 300, y: 200, width: 160, height: shapeType === 'arrow' ? 4 : 120, rotation: 0,
            shapeType, fill: '#38bdf8',
            stroke: shapeType === 'arrow' ? '#38bdf8' : undefined,
            strokeWidth: shapeType === 'arrow' ? 3 : 0,
        };
        setSlides((prev) =>
            prev.map((s, i) => (i === activeIndex ? { ...s, elements: [...s.elements, el] } : s))
        );
        setSelectedElementId(el.id);
    }, [activeIndex, pushUndoSnapshot]);

    const updateSpeakerNotes = useCallback((notes: string) => {
        // Notes might be edited frequently, maybe just push once?
        // For now, let's keep it simple.
        setSlides((prev) =>
            prev.map((s, i) => (i === activeIndex ? { ...s, speakerNotes: notes } : s))
        );
    }, [activeIndex]);

    // ── AI Handlers ───────────────────────────────────────────────────

    const handleTextToSlide = useCallback(async () => {
        if (!aiTopic.trim()) return;
        setAiLoading(true);
        try {
            pushUndoSnapshot();
            const outline = await aiSvc.generateSlideOutline(aiSettings, aiTopic);
            if (outline.length > 0) {
                const newSlides: Slide[] = outline.map((item) => {
                    const layout = SLIDE_LAYOUTS.find(l => l.id === item.layout) || SLIDE_LAYOUTS[1];
                    const s = createSlide(layout.id);
                    // Replace text elements with content from outline
                    const titleEl = s.elements.find(e => e.type === 'text' && (e.fontSize || 0) >= 30);
                    if (titleEl) titleEl.text = item.title;
                    const contentEl = s.elements.find(e => e.type === 'text' && (e.fontSize || 0) < 30);
                    if (contentEl) contentEl.text = item.bullets.map(b => `• ${b}`).join('\n');
                    return s;
                });
                setSlides(newSlides);
                setActiveIndex(0);
                setDocName(aiTopic);
            }
        } catch (err) {
            console.error('Text-to-Slide failed:', err);
        } finally {
            setAiLoading(false);
            setShowAIDialog(false);
            setAiTopic('');
        }
    }, [aiTopic, aiSettings, pushUndoSnapshot]);

    const handleMagicLayout = useCallback(async () => {
        if (activeSlide.elements.length === 0) return;
        setAiLoading(true);
        try {
            pushUndoSnapshot();
            const elSummary = activeSlide.elements.map(e => ({
                id: e.id, type: e.type, width: e.width, height: e.height,
            }));
            const result = await aiSvc.magicLayout(aiSettings, elSummary);
            if (result.length > 0) {
                setSlides(prev => prev.map((s, i) => {
                    if (i !== activeIndex) return s;
                    return {
                        ...s,
                        elements: s.elements.map(el => {
                            const layout = result.find(r => r.id === el.id);
                            return layout ? { ...el, x: layout.x, y: layout.y, width: layout.width, height: layout.height } : el;
                        }),
                    };
                }));
            }
        } catch (err) {
            console.error('Magic Layout failed:', err);
        } finally {
            setAiLoading(false);
        }
    }, [activeSlide, activeIndex, aiSettings, pushUndoSnapshot]);

    const handleVibeCheck = useCallback(async (tone: string) => {
        setShowVibeMenu(false);
        setAiLoading(true);
        try {
            pushUndoSnapshot();
            const texts = slides.flatMap(s => s.elements.filter(e => e.type === 'text').map(e => e.text || ''));
            const result = await aiSvc.vibeCheckSlides(aiSettings, texts, tone);
            if (result.length > 0) {
                let idx = 0;
                setSlides(prev => prev.map(s => ({
                    ...s,
                    elements: s.elements.map(el => {
                        if (el.type === 'text' && idx < result.length) {
                            return { ...el, text: result[idx++] };
                        }
                        return el;
                    }),
                })));
            }
        } catch (err) {
            console.error('Vibe-Check failed:', err);
        } finally {
            setAiLoading(false);
        }
    }, [slides, aiSettings, pushUndoSnapshot]);

    const handleGenerateSpeakerNotes = useCallback(async () => {
        setAiLoading(true);
        try {
            const title = activeSlide.elements.find(e => e.type === 'text' && (e.fontSize || 0) >= 30)?.text || 'Folie';
            const bullets = activeSlide.elements.filter(e => e.type === 'text').map(e => e.text || '').join('\n');
            const notes = await aiSvc.generateSpeakerNotes(aiSettings, title, bullets);
            updateSpeakerNotes(notes);
            setShowNotesPanel(true);
        } catch (err) {
            console.error('Speaker Notes generation failed:', err);
        } finally {
            setAiLoading(false);
        }
    }, [activeSlide, aiSettings, updateSpeakerNotes]);

    // ── PDF Export ────────────────────────────────────────────────────

    const handlePdfExport = useCallback(async () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        printWindow.document.write(`<html><head><title>${docName}</title><style>
            @page { size: landscape; margin: 0; }
            body { margin: 0; }
            img { width: 100vw; height: 100vh; object-fit: contain; page-break-after: always; display: block; background: #0f172a; }
            img:last-child { page-break-after: avoid; }
        </style></head><body>`);

        // Render each slide via hidden Konva stage
        const Konva = (await import('konva')).default;
        for (const slide of slides) {
            const container = document.createElement('div');
            container.style.position = 'fixed';
            container.style.left = '-9999px';
            document.body.appendChild(container);

            const stage = new Konva.Stage({ container, width: CANVAS_WIDTH, height: CANVAS_HEIGHT });
            const layer = new Konva.Layer();
            stage.add(layer);

            // Background
            const bg = new Konva.Rect({ x: 0, y: 0, width: CANVAS_WIDTH, height: CANVAS_HEIGHT, fill: slide.background.startsWith('linear') ? '#0f172a' : slide.background });
            layer.add(bg);

            // Elements
            for (const el of slide.elements) {
                if (el.type === 'text') {
                    const t = new Konva.Text({
                        x: el.x, y: el.y, width: el.width, height: el.height,
                        text: el.text || '', fontSize: el.fontSize || 20,
                        fontFamily: el.fontFamily || 'Inter, sans-serif',
                        fontStyle: el.fontStyle || 'normal', fill: el.fill || '#e2e8f0',
                        align: el.align || 'left', rotation: el.rotation,
                    });
                    layer.add(t);
                } else if (el.type === 'shape') {
                    if (el.shapeType === 'circle') {
                        const c = new Konva.Circle({
                            x: el.x + el.width / 2, y: el.y + el.height / 2,
                            radius: Math.min(el.width, el.height) / 2,
                            fill: el.fill || '#1e293b', rotation: el.rotation,
                        });
                        layer.add(c);
                    } else {
                        const r = new Konva.Rect({
                            x: el.x, y: el.y, width: el.width, height: el.height,
                            fill: el.fill || '#1e293b', cornerRadius: el.shapeType === 'arrow' ? 0 : 4,
                            rotation: el.rotation,
                        });
                        layer.add(r);
                    }
                } else if (el.type === 'image' && el.src) {
                    // Load image synchronously (well, promise-based)
                    const imgObj = new Image();
                    imgObj.src = el.src;
                    await new Promise((resolve) => {
                        imgObj.onload = resolve;
                        imgObj.onerror = resolve; // Continue anyway
                    });
                    const kImg = new Konva.Image({
                        x: el.x, y: el.y, width: el.width, height: el.height,
                        image: imgObj, rotation: el.rotation,
                    });
                    layer.add(kImg);
                }
            }

            layer.draw();
            const dataUrl = stage.toDataURL({ pixelRatio: 2 });
            printWindow.document.write(`<img src="${dataUrl}" />`);

            stage.destroy();
            document.body.removeChild(container);
        }

        printWindow.document.write('</body></html>');
        printWindow.document.close();
        setTimeout(() => printWindow.print(), 500);
    }, [slides, docName]);

    const handlePptxExport = useCallback(async () => {
        const pptx = new PptxGenJS();
        pptx.layout = 'LAYOUT_16x9';

        for (const slide of slides) {
            const pptSlide = pptx.addSlide();
            
            // Background (basic color only in this simple implementation)
            if (slide.background.startsWith('#')) {
                pptSlide.background = { fill: slide.background.replace('#', '') };
            }

            for (const el of slide.elements) {
                const props = {
                    x: (el.x / CANVAS_WIDTH) * 10,
                    y: (el.y / CANVAS_HEIGHT) * 5.625,
                    w: (el.width / CANVAS_WIDTH) * 10,
                    h: (el.height / CANVAS_HEIGHT) * 5.625,
                    rotate: el.rotation || 0,
                };

                if (el.type === 'text') {
                        const textAlign: 'left' | 'center' | 'right' = el.align === 'center' || el.align === 'right' ? el.align : 'left';
                        pptSlide.addText(el.text || '', {
                            ...props,
                            fontSize: (el.fontSize || 20) * 0.75,
                            color: (el.fill || '#000000').replace('#', ''),
                            align: textAlign,
                            fontFace: 'Arial',
                        });
                } else if (el.type === 'image' && el.src) {
                    pptSlide.addImage({
                        data: el.src, // Base64 works
                        ...props,
                    });
                } else if (el.type === 'shape') {
                    const shapeType = el.shapeType === 'circle' ? pptx.ShapeType.ellipse : pptx.ShapeType.rect;
                    pptSlide.addShape(shapeType, {
                        ...props,
                        fill: { color: (el.fill || '#38bdf8').replace('#', '') },
                    });
                }
            }
            if (slide.speakerNotes) {
                pptSlide.addNotes(slide.speakerNotes);
            }
        }

        pptx.writeFile({ fileName: `${docName || 'Presentation'}.pptx` });
    }, [slides, docName]);

    // ── Canvas scale ────────────────────────────────────────────────────
    const canvasContainerRef = useRef<HTMLDivElement>(null);
    const [canvasScale, setCanvasScale] = useState(1);

    React.useEffect(() => {
        const resize = () => {
            if (!canvasContainerRef.current) return;
            const { width, height } = canvasContainerRef.current.getBoundingClientRect();
            const scaleX = (width - 40) / CANVAS_WIDTH;
            const scaleY = (height - 40) / CANVAS_HEIGHT;
            setCanvasScale(Math.min(scaleX, scaleY, 1.5));
        };
        resize();
        window.addEventListener('resize', resize);
        return () => window.removeEventListener('resize', resize);
    }, []);

    // ── Render ──────────────────────────────────────────────────────────

    return (
        <div style={{ display: 'flex', height: '100%', background: '#0c1222', color: '#e2e8f0', overflow: 'hidden' }}>

            {/* ── LEFT SIDEBAR: Slide Thumbnails ─────────────────────────── */}
            <div style={{
                width: 200, minWidth: 200, borderRight: '1px solid rgba(255,255,255,0.08)',
                display: 'flex', flexDirection: 'column', background: 'rgba(15,23,42,0.8)',
            }}>
                <div style={{ padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button
                        onClick={() => setShowLayoutPicker(!showLayoutPicker)}
                        style={{
                            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                            padding: '8px 12px', background: 'linear-gradient(135deg, #0284c7, #0369a1)', color: '#fff',
                            border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600
                        }}
                    >
                        <Plus size={16} /> {t('new_slide')}
                    </button>
                </div>

                {/* Layout Picker Dropdown */}
                {showLayoutPicker && (
                    <div style={{
                        padding: '8px', background: '#1e293b', borderBottom: '1px solid rgba(255,255,255,0.06)',
                        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6,
                    }}>
                        {SLIDE_LAYOUTS.map((layout) => (
                            <button
                                key={layout.id}
                                onClick={() => addSlide(layout.id)}
                                style={{
                                    padding: '8px 6px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: 4, color: '#e2e8f0', cursor: 'pointer', fontSize: '0.72rem', textAlign: 'center',
                                }}
                            >
                                <span style={{ fontSize: '1.2rem' }}>{layout.icon}</span><br />
                                {layout.name}
                            </button>
                        ))}
                    </div>
                )}

                {/* Slide List */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
                    {slides.map((slide, idx) => (
                        <div
                            key={slide.id}
                            draggable
                            onDragStart={() => setDraggedSlideIdx(idx)}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                                e.preventDefault();
                                if (draggedSlideIdx !== null) {
                                    reorderSlides(draggedSlideIdx, idx);
                                    setDraggedSlideIdx(null);
                                }
                            }}
                            onClick={() => { setActiveIndex(idx); setSelectedElementId(null); }}
                            onContextMenu={(e) => { e.preventDefault(); setContextMenu({ x: e.clientX, y: e.clientY, slideIdx: idx }); }}
                            style={{
                                padding: '6px', marginBottom: 6, borderRadius: 6, cursor: 'grab',
                                border: idx === activeIndex ? '2px solid #38bdf8' : (draggedSlideIdx === idx ? '2px dashed #64748b' : '2px solid transparent'),
                                background: idx === activeIndex ? 'rgba(56,189,248,0.1)' : 'rgba(255,255,255,0.03)',
                                transition: 'all 0.15s ease',
                                opacity: draggedSlideIdx === idx ? 0.5 : 1,
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>{idx + 1}</span>
                                <div style={{ display: 'flex', gap: 2 }}>
                                    <button onClick={(e) => { e.stopPropagation(); moveSlide(idx, -1); }}
                                        style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 2 }} title="Hoch">
                                        <ChevronUp size={12} />
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); moveSlide(idx, 1); }}
                                        style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 2 }} title="Runter">
                                        <ChevronDown size={12} />
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); duplicateSlide(idx); }}
                                        style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 2 }} title="Duplizieren">
                                        <Copy size={12} />
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); deleteSlide(idx); }}
                                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 2 }} title="Löschen">
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            </div>
                            {/* Mini preview */}
                            <div style={{
                                marginTop: 4, background: slide.background.startsWith('linear') ? '#0f172a' : slide.background,
                                borderRadius: 4, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '0.6rem', color: '#64748b', overflow: 'hidden',
                            }}>
                                {slide.elements.find(e => e.type === 'text')?.text?.substring(0, 40) || '(Leer)'}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── MAIN AREA ──────────────────────────────────────────────── */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

                {/* TOOLBAR / RIBBON */}
                <div style={{
                    padding: '8px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)',
                    display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(15,23,42,0.6)',
                    flexWrap: 'wrap',
                }}>
                    {/* Doc Title */}
                    <input
                        type="text"
                        value={docName}
                        onChange={(e) => setDocName(e.target.value)}
                        style={{
                            background: 'transparent', border: 'none', color: '#f8fafc',
                            fontSize: '0.95rem', fontWeight: 600, outline: 'none', padding: '4px 8px',
                            borderRadius: 4, width: 220,
                        }}
                        placeholder="Präsentationsname"
                    />

                    <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.1)' }} />

                    {/* Undo / Redo */}
                    <ToolBtn icon={<Undo2 size={16} />} label="Rückgängig" onClick={handleUndo} />
                    <ToolBtn icon={<Redo2 size={16} />} label="Wiederholen" onClick={handleRedo} />

                    <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.1)' }} />

                    {/* Insert Tools */}
                    <ToolBtn icon={<Type size={16} />} label="Text" onClick={addTextbox} />
                    <ToolBtn icon={<ImageIcon size={16} />} label="Bild" onClick={() => setShowImageModal(true)} />
                    <ToolBtn icon={<Square size={16} />} label="Rechteck" onClick={() => addShape('rect')} />
                    <ToolBtn icon={<Circle size={16} />} label="Kreis" onClick={() => addShape('circle')} />
                    <ToolBtn icon={<ArrowRight size={16} />} label="Pfeil" onClick={() => addShape('arrow')} />

                    <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.1)' }} />

                    {/* Layout */}
                    <ToolBtn icon={<Layout size={16} />} label="Layout" onClick={() => setShowLayoutPicker(!showLayoutPicker)} />
                    <ToolBtn icon={<StickyNote size={16} />} label="Notizen" onClick={() => setShowNotesPanel(!showNotesPanel)} active={showNotesPanel} />

                    <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.1)' }} />

                    {/* AI Tools */}
                    <ToolBtn icon={<Sparkles size={16} />} label="KI-Gliederung" onClick={() => setShowAIDialog(true)} />
                    <ToolBtn icon={<Wand2 size={16} />} label="Magic Layout" onClick={handleMagicLayout} />
                    <ToolBtn icon={<MessageSquare size={16} />} label="Notizen KI" onClick={handleGenerateSpeakerNotes} />

                    {/* Vibe-Check Dropdown */}
                    <div style={{ position: 'relative' }}>
                        <ToolBtn icon={aiLoading ? <Loader2 size={16} className="spin" /> : <Sparkles size={16} />} label="Vibe-Check" onClick={() => setShowVibeMenu(!showVibeMenu)} />
                        {showVibeMenu && (
                            <div style={{
                                position: 'absolute', top: '100%', left: 0, marginTop: 4, zIndex: 100,
                                background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: 8, padding: 4, minWidth: 180, boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                            }}>
                                {['Professioneller', 'Spannender', 'Lockerer', 'Kürzer', 'Ausführlicher'].map((tone) => (
                                    <CtxItem key={tone} label={tone} onClick={() => handleVibeCheck(tone)} />
                                ))}
                            </div>
                        )}
                    </div>

                    <div style={{ flex: 1 }} />

                    {/* Save status */}
                    <span style={{ fontSize: '0.75rem', color: '#64748b', marginRight: 8 }}>
                        {saveStatus}
                    </span>

                    {/* Slide Count */}
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        Folie {activeIndex + 1} / {slides.length}
                    </span>

                    {/* Export PDF/PPTX Button */}
                    <div style={{ display: 'flex', gap: 4 }}>
                        <button
                            onClick={handlePdfExport}
                            title="Als PDF exportieren"
                            style={{
                                display: 'flex', alignItems: 'center', gap: 6,
                                padding: '8px 12px', background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#e2e8f0', cursor: 'pointer',
                                fontSize: '0.85rem', fontWeight: 600,
                            }}
                        >
                            <Printer size={16} /> PDF
                        </button>
                        <button
                            onClick={handlePptxExport}
                            title="Als PPTX exportieren"
                            style={{
                                display: 'flex', alignItems: 'center', gap: 6,
                                padding: '8px 12px', background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#e2e8f0', cursor: 'pointer',
                                fontSize: '0.85rem', fontWeight: 600,
                            }}
                        >
                            <Download size={16} /> PPTX
                        </button>
                    </div>

                    {/* PLAY BUTTON */}
                    <button
                        onClick={() => setShowPresentation(true)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            padding: '8px 16px', background: 'linear-gradient(135deg, #16a34a, #15803d)',
                            border: 'none', borderRadius: 6, color: '#fff', cursor: 'pointer',
                            fontSize: '0.85rem', fontWeight: 600,
                        }}
                    >
                        <Play size={16} /> {t('present')}
                    </button>
                </div>

                {/* CANVAS AREA */}
                <div
                    ref={canvasContainerRef}
                    style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: '#0a0f1e', overflow: 'hidden', position: 'relative',
                    }}
                >
                    <SlideCanvas
                        slide={activeSlide}
                        selectedId={selectedElementId}
                        onSelect={setSelectedElementId}
                        onElementUpdate={updateElement}
                        onElementDelete={deleteElement}
                        scale={canvasScale}
                    />
                </div>

                {/* SPEAKER NOTES PANEL */}
                {showNotesPanel && (
                    <div style={{
                        height: 140, borderTop: '1px solid rgba(255,255,255,0.08)',
                        background: 'rgba(15,23,42,0.8)', padding: '8px 16px',
                        display: 'flex', flexDirection: 'column',
                    }}>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: 4, fontWeight: 600 }}>
                            {t('speaker_notes')}
                        </div>
                        <textarea
                            value={activeSlide.speakerNotes}
                            onChange={(e) => updateSpeakerNotes(e.target.value)}
                            placeholder="Notizen für diese Folie..."
                            style={{
                                flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: 6, color: '#e2e8f0', padding: '8px', fontSize: '0.85rem',
                                resize: 'none', outline: 'none', fontFamily: 'Inter, sans-serif',
                            }}
                        />
                    </div>
                )}
            </div>

            {/* ── Context Menu ───────────────────────────────────────────── */}
            {contextMenu && (
                <>
                    <div style={{ position: 'fixed', inset: 0, zIndex: 999 }} onClick={() => setContextMenu(null)} />
                    <div style={{
                        position: 'fixed', left: contextMenu.x, top: contextMenu.y, zIndex: 1000,
                        background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 8, padding: 4, minWidth: 160, boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                    }}>
                        <CtxItem label={t('duplicate')} onClick={() => { duplicateSlide(contextMenu.slideIdx); setContextMenu(null); }} />
                        <CtxItem label={t('move_up')} onClick={() => { moveSlide(contextMenu.slideIdx, -1); setContextMenu(null); }} />
                        <CtxItem label={t('move_down')} onClick={() => { moveSlide(contextMenu.slideIdx, 1); setContextMenu(null); }} />
                        <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '4px 0' }} />
                        <CtxItem label={t('delete')} danger onClick={() => { deleteSlide(contextMenu.slideIdx); setContextMenu(null); }} />
                    </div>
                </>
            )}

            {/* ── Image Upload Modal ─────────────────────────────────────── */}
            <ImageUploadModal
                isOpen={showImageModal}
                onClose={() => setShowImageModal(false)}
                onInsert={handleImageInsert}
                showAlignment={false}
            />

            {/* ── Presentation Mode ────────────────────────────────────── */}
            {showPresentation && (
                <PresentationMode
                    slides={slides}
                    startIndex={activeIndex}
                    onExit={() => setShowPresentation(false)}
                />
            )}

            {/* ── AI: Text-to-Slide Dialog ─────────────────────────────── */}
            {showAIDialog && (
                <>
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 2000 }} onClick={() => setShowAIDialog(false)} />
                    <div style={{
                        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                        zIndex: 2001, background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 16, padding: 32, width: 500, boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
                    }}>
                        <h3 style={{ color: '#f8fafc', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Sparkles size={20} color="#38bdf8" /> KI-Gliederung erstellen
                        </h3>
                        <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: 16 }}>
                            Gib ein Thema ein und die KI erstellt eine komplette Pr&auml;sentation mit 5-10 Folien.
                        </p>
                        <input
                            type="text"
                            value={aiTopic}
                            onChange={(e) => setAiTopic(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleTextToSlide(); }}
                            placeholder="z.B. Quartalsbericht Marketing Q3"
                            style={{
                                width: '100%', padding: '12px 16px', background: 'rgba(0,0,0,0.3)',
                                border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8,
                                color: '#f8fafc', fontSize: '0.95rem', outline: 'none',
                                boxSizing: 'border-box',
                            }}
                            autoFocus
                        />
                        <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setShowAIDialog(false)}
                                style={{ padding: '10px 20px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#94a3b8', cursor: 'pointer' }}
                            >
                                Abbrechen
                            </button>
                            <button
                                onClick={handleTextToSlide}
                                disabled={aiLoading || !aiTopic.trim()}
                                style={{
                                    padding: '10px 24px', background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                                    border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer',
                                    fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6,
                                    opacity: aiLoading || !aiTopic.trim() ? 0.5 : 1,
                                }}
                            >
                                {aiLoading ? <><Loader2 size={16} /> Generiere...</> : <><Sparkles size={16} /> Erstellen</>}
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

// ── Small UI Components ─────────────────────────────────────────────

const ToolBtn: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void; active?: boolean }> = ({ icon, label, onClick, active }) => (
    <button
        onClick={onClick}
        title={label}
        style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '6px 10px', background: active ? 'rgba(56,189,248,0.15)' : 'transparent',
            border: active ? '1px solid rgba(56,189,248,0.3)' : '1px solid transparent',
            borderRadius: 6, color: active ? '#38bdf8' : '#94a3b8', cursor: 'pointer',
            fontSize: '0.78rem', transition: 'all 0.15s ease',
        }}
    >
        {icon}
        <span style={{ display: 'none' }}>{label}</span>
    </button>
);

const CtxItem: React.FC<{ label: string; onClick: () => void; danger?: boolean }> = ({ label, onClick, danger }) => (
    <button
        onClick={onClick}
        style={{
            display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px',
            background: 'none', border: 'none', color: danger ? '#ef4444' : '#e2e8f0',
            cursor: 'pointer', fontSize: '0.82rem', borderRadius: 4,
        }}
        onMouseEnter={(e) => { (e.target as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; }}
        onMouseLeave={(e) => { (e.target as HTMLElement).style.background = 'none'; }}
    >
        {label}
    </button>
);

export default SepShow;
