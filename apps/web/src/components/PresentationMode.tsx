/*
    PresentationMode — Fullscreen presentation mode with keyboard control
    and optional presenter view.

    English developer notes:

    - Purpose: Provide a distraction-free fullscreen presentation experience
        including a presenter view (preview + notes). Fullscreen is requested
        on mount to mimic native presentation apps.

    - Decisions & rationale:
        * Cursor hiding: show cursor briefly on movement and hide to emulate
            presentation behaviour. We use a short timer to avoid excessive DOM
            updates and ensure it works on touch/mouse.
        * Keyboard navigation: standard keys (Arrow keys, Space, PageUp/Down)
            advance slides for accessibility and presenter control.

    - Notes: `cursorTimerRef` is intentionally typed as `number | null` so it
        can store values returned by `window.setTimeout` across environments.
*/
import React, { useState, useEffect, useCallback, useRef } from 'react';
import SlideCanvas, { CANVAS_WIDTH, CANVAS_HEIGHT } from './SlideCanvas';
import type { Slide } from './SlideCanvas';
import { X, ChevronLeft, ChevronRight, StickyNote } from 'lucide-react';

interface PresentationModeProps {
    slides: Slide[];
    startIndex?: number;
    onExit: () => void;
}

const PresentationMode: React.FC<PresentationModeProps> = ({ slides, startIndex = 0, onExit }) => {
    const [currentIndex, setCurrentIndex] = useState(startIndex);
    const [showPresenterView, setShowPresenterView] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const cursorTimerRef = useRef<number | null>(null);
    const [scale, setScale] = useState(1);

    const currentSlide = slides[currentIndex];
    const nextSlide = slides[currentIndex + 1];

    // Enter fullscreen on mount
    useEffect(() => {
        const el = containerRef.current;
        if (el && el.requestFullscreen) {
            el.requestFullscreen().catch(() => { });
        }
        return () => {
            if (document.fullscreenElement) {
                document.exitFullscreen().catch(() => { });
            }
        };
    }, []);

    useEffect(() => () => {
        if (cursorTimerRef.current) {
            clearTimeout(cursorTimerRef.current);
            cursorTimerRef.current = null;
        }
    }, []);

    // Calculate scale to fit screen
    useEffect(() => {
        const resize = () => {
            const w = window.innerWidth;
            const h = window.innerHeight;
            if (showPresenterView) {
                // Main slide takes ~65% width
                const mainW = w * 0.65;
                const sx = mainW / CANVAS_WIDTH;
                const sy = h / CANVAS_HEIGHT;
                setScale(Math.min(sx, sy) * 0.9);
            } else {
                const sx = w / CANVAS_WIDTH;
                const sy = h / CANVAS_HEIGHT;
                setScale(Math.min(sx, sy));
            }
        };
        resize();
        window.addEventListener('resize', resize);
        return () => window.removeEventListener('resize', resize);
    }, [showPresenterView]);

    // Keyboard navigation
    const navigate = useCallback((dir: 1 | -1) => {
        setCurrentIndex((prev) => Math.max(0, Math.min(slides.length - 1, prev + dir)));
    }, [slides.length]);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            switch (e.key) {
                case 'ArrowRight':
                case ' ':
                case 'PageDown':
                    e.preventDefault();
                    navigate(1);
                    break;
                case 'ArrowLeft':
                case 'PageUp':
                    e.preventDefault();
                    navigate(-1);
                    break;
                case 'Escape':
                    onExit();
                    break;
                case 'Home':
                    setCurrentIndex(0);
                    break;
                case 'End':
                    setCurrentIndex(slides.length - 1);
                    break;
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [navigate, onExit, slides.length]);

    // Mouse click to advance
    const handleClick = useCallback((e: React.MouseEvent) => {
        // Only advance on click on the slide area, not controls
        if ((e.target as HTMLElement).closest('.pres-controls')) return;
        navigate(1);
    }, [navigate]);

    if (!currentSlide) return null;

    return (
        <div
            ref={containerRef}
            onClick={handleClick}
            style={{
                position: 'fixed', inset: 0, zIndex: 10000,
                background: '#000', display: 'flex',
                cursor: 'none',
            }}
            onMouseMove={(e) => {
                // Show cursor briefly on movement
                const el = e.currentTarget;
                el.style.cursor = 'default';
                if (cursorTimerRef.current) {
                    clearTimeout(cursorTimerRef.current);
                }
                cursorTimerRef.current = window.setTimeout(() => {
                    el.style.cursor = 'none';
                    cursorTimerRef.current = null;
                }, 2000);
            }}
        >
            {showPresenterView ? (
                /* ── PRESENTER VIEW ────────────────────────────────────────── */
                <>
                    {/* Main Slide */}
                    <div style={{ flex: 0.65, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <SlideCanvas
                            slide={currentSlide}
                            selectedId={null}
                            onSelect={() => { }}
                            onElementUpdate={() => { }}
                            onElementDelete={() => { }}
                            scale={scale}
                            interactive={false}
                        />
                    </div>

                    {/* Sidebar */}
                    <div style={{
                        flex: 0.35, background: '#111827', display: 'flex', flexDirection: 'column',
                        borderLeft: '2px solid #1e293b', padding: 16,
                    }}
                        className="pres-controls"
                    >
                        {/* Next Slide Preview */}
                        <div style={{ marginBottom: 16 }}>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: 8, fontWeight: 600 }}>
                                Nächste Folie
                            </div>
                            {nextSlide ? (
                                <div style={{ transform: 'scale(0.3)', transformOrigin: 'top left', width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}>
                                    <SlideCanvas
                                        slide={nextSlide}
                                        selectedId={null}
                                        onSelect={() => { }}
                                        onElementUpdate={() => { }}
                                        onElementDelete={() => { }}
                                        scale={1}
                                        interactive={false}
                                    />
                                </div>
                            ) : (
                                <div style={{ padding: 20, color: '#64748b', fontSize: '0.85rem', textAlign: 'center' }}>
                                    Ende der Präsentation
                                </div>
                            )}
                        </div>

                        {/* Speaker Notes */}
                        <div style={{ flex: 1, overflow: 'auto' }}>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: 8, fontWeight: 600 }}>
                                Sprechernotizen
                            </div>
                            <div style={{
                                color: '#e2e8f0', fontSize: '1rem', lineHeight: 1.6,
                                background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: 16,
                                whiteSpace: 'pre-wrap',
                            }}>
                                {currentSlide.speakerNotes || 'Keine Notizen für diese Folie.'}
                            </div>
                        </div>

                        {/* Slide Counter */}
                        <div style={{ marginTop: 12, textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                            {currentIndex + 1} / {slides.length}
                        </div>
                    </div>
                </>
            ) : (
                /* ── NORMAL VIEW ───────────────────────────────────────────── */
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <SlideCanvas
                        slide={currentSlide}
                        selectedId={null}
                        onSelect={() => { }}
                        onElementUpdate={() => { }}
                        onElementDelete={() => { }}
                        scale={scale}
                        interactive={false}
                    />
                </div>
            )}

            {/* ── Bottom Controls Bar ────────────────────────────────────── */}
            <div
                className="pres-controls"
                style={{
                    position: 'fixed', bottom: 0, left: 0, right: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                    padding: '10px 20px', background: 'rgba(0,0,0,0.7)',
                    opacity: 0, transition: 'opacity 0.3s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = '0'; }}
            >
                <PresBtn onClick={() => navigate(-1)} disabled={currentIndex === 0}>
                    <ChevronLeft size={18} />
                </PresBtn>

                <span style={{ color: '#94a3b8', fontSize: '0.85rem', minWidth: 60, textAlign: 'center' }}>
                    {currentIndex + 1} / {slides.length}
                </span>

                <PresBtn onClick={() => navigate(1)} disabled={currentIndex === slides.length - 1}>
                    <ChevronRight size={18} />
                </PresBtn>

                <div style={{ width: 1, height: 20, background: '#334155' }} />

                <PresBtn onClick={() => setShowPresenterView(!showPresenterView)} active={showPresenterView}>
                    <StickyNote size={16} />
                </PresBtn>

                <PresBtn onClick={onExit}>
                    <X size={16} />
                </PresBtn>
            </div>
        </div>
    );
};

// Button helper
const PresBtn: React.FC<{
    onClick: () => void;
    disabled?: boolean;
    active?: boolean;
    children: React.ReactNode;
}> = ({ onClick, disabled, active, children }) => (
    <button
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        disabled={disabled}
        style={{
            background: active ? 'rgba(56,189,248,0.2)' : 'rgba(255,255,255,0.1)',
            border: 'none', borderRadius: 6, padding: '8px 12px',
            color: disabled ? '#475569' : '#e2e8f0', cursor: disabled ? 'default' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.15s ease',
        }}
    >
        {children}
    </button>
);

export default PresentationMode;
