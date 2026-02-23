import React, { useState, useEffect } from 'react';
import { X, Printer, Settings, LayoutTemplate } from 'lucide-react';

interface PrintPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPrint: () => void;
    previewContent: React.ReactNode;
    defaultOrientation?: 'portrait' | 'landscape';
}

export type PaperFormat = 'A4' | 'A5' | 'Letter' | 'Legal';
export type Orientation = 'portrait' | 'landscape';
export type MarginSize = 'normal' | 'narrow' | 'wide';

export const PrintPreviewModal: React.FC<PrintPreviewModalProps> = ({
    isOpen,
    onClose,
    onPrint,
    previewContent,
    defaultOrientation = 'portrait'
}) => {
    const [format, setFormat] = useState<PaperFormat>('A4');
    const [orientation, setOrientation] = useState<Orientation>(defaultOrientation);
    const [margins, setMargins] = useState<MarginSize>('normal');

    // Update the injected style tag when settings change
    useEffect(() => {
        if (!isOpen) return;

        const styleId = 'print-page-settings';
        let styleEl = document.getElementById(styleId);

        if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.id = styleId;
            document.head.appendChild(styleEl);
        }

        // Calculate margin size
        let marginCSS = '2cm'; // normal
        if (margins === 'narrow') marginCSS = '1cm';
        if (margins === 'wide') marginCSS = '3cm';

        // Set @page rules for the browser's print dialog
        styleEl.innerHTML = `
            @page {
                size: ${format} ${orientation};
                margin: ${marginCSS};
            }
            :root {
                --print-margin: ${marginCSS};
            }
            
            /* Print Preview Overrides */
            .print-preview-content .ProseMirror {
                background: white !important;
                color: black !important;
            }
            .print-preview-content .ProseMirror p, 
            .print-preview-content .ProseMirror h1, 
            .print-preview-content .ProseMirror h2, 
            .print-preview-content .ProseMirror h3,
            .print-preview-content .ProseMirror ul, 
            .print-preview-content .ProseMirror ol, 
            .print-preview-content .ProseMirror li,
            .print-preview-content .ProseMirror span {
                color: black !important;
            }
            .print-preview-content .ProseMirror blockquote {
                border-left-color: #000 !important;
                color: #444 !important;
            }
        `;

        return () => {
            // We do NOT remove it immediately on unmount because the react-to-print
            // hook opens the dialog async and might need it. We rely on overwriting it next time.
        };
    }, [isOpen, format, orientation, margins]);

    if (!isOpen) return null;

    // Determine preview box dimensions to simulate aspect ratio
    // These are relative visual sizes for the UI preview only
    const getPreviewDimensions = () => {
        let width = 210; // base arbitrary unit (mm equivalent)
        let height = 297;

        if (format === 'A5') { width = 148; height = 210; }
        if (format === 'Letter') { width = 216; height = 279; }
        if (format === 'Legal') { width = 216; height = 356; }

        if (orientation === 'landscape') {
            const temp = width;
            width = height;
            height = temp;
        }

        // Calculate a reasonable scaling factor to fit the UI
        const scale = 1.6; // Adjust this to fit nicely in the right panel

        return { width: width * scale, height: height * scale };
    };

    const { width: previewWidth, height: previewHeight } = getPreviewDimensions();

    return (
        <div style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.8)",
            backdropFilter: "blur(8px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999, // Very high to sit above everything
        }}>
            <div style={{
                background: "rgba(30, 41, 59, 0.95)",
                border: "1px solid var(--glass-border)",
                borderRadius: "12px",
                width: "90vw",
                height: "85vh",
                maxWidth: "1200px",
                display: "flex",
                flexDirection: "column",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
                overflow: "hidden"
            }}>
                {/* HEADER */}
                <div style={{
                    padding: "1rem 1.5rem",
                    borderBottom: "1px solid var(--glass-border)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexShrink: 0
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <LayoutTemplate size={20} color="#38bdf8" />
                        <h2 style={{
                            margin: 0,
                            fontSize: "1.25rem",
                            background: "linear-gradient(to right, #38bdf8, #818cf8)",
                            backgroundClip: "text",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent"
                        }}>
                            Druckvorschau & PDF Export
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer", padding: "4px" }}
                        title="Schließen"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* CONTENT AREA */}
                <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

                    {/* LEFT PANEL: SETTINGS */}
                    <div style={{
                        width: "300px",
                        padding: "1.5rem",
                        borderRight: "1px solid var(--glass-border)",
                        background: "rgba(15, 23, 42, 0.3)",
                        display: "flex",
                        flexDirection: "column",
                        gap: "1.5rem",
                        overflowY: "auto"
                    }}>

                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#e2e8f0", fontWeight: "600", marginBottom: "-0.5rem" }}>
                            <Settings size={16} /> Druckeinstellungen
                        </div>

                        {/* Format Selection */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                            <label style={{ fontSize: "0.85rem", color: "#94a3b8" }}>Papierformat</label>
                            <select
                                value={format}
                                onChange={(e) => setFormat(e.target.value as PaperFormat)}
                                style={{
                                    background: "rgba(15, 23, 42, 0.6)",
                                    border: "1px solid var(--glass-border)",
                                    color: "#e2e8f0",
                                    padding: "0.5rem",
                                    borderRadius: "6px",
                                    outline: "none"
                                }}
                            >
                                <option value="A4">A4 (210 x 297 mm)</option>
                                <option value="A5">A5 (148 x 210 mm)</option>
                                <option value="Letter">US Letter (8.5 x 11 in)</option>
                                <option value="Legal">US Legal (8.5 x 14 in)</option>
                            </select>
                        </div>

                        {/* Orientation Selection */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                            <label style={{ fontSize: "0.85rem", color: "#94a3b8" }}>Ausrichtung</label>
                            <div style={{ display: "flex", gap: "0.5rem" }}>
                                <button
                                    onClick={() => setOrientation('portrait')}
                                    style={{
                                        flex: 1,
                                        padding: "0.5rem",
                                        background: orientation === 'portrait' ? "rgba(56, 189, 248, 0.2)" : "rgba(15, 23, 42, 0.6)",
                                        border: `1px solid ${orientation === 'portrait' ? "#38bdf8" : "var(--glass-border)"}`,
                                        color: orientation === 'portrait' ? "#38bdf8" : "#94a3b8",
                                        borderRadius: "6px",
                                        cursor: "pointer"
                                    }}
                                >
                                    Hochformat
                                </button>
                                <button
                                    onClick={() => setOrientation('landscape')}
                                    style={{
                                        flex: 1,
                                        padding: "0.5rem",
                                        background: orientation === 'landscape' ? "rgba(56, 189, 248, 0.2)" : "rgba(15, 23, 42, 0.6)",
                                        border: `1px solid ${orientation === 'landscape' ? "#38bdf8" : "var(--glass-border)"}`,
                                        color: orientation === 'landscape' ? "#38bdf8" : "#94a3b8",
                                        borderRadius: "6px",
                                        cursor: "pointer"
                                    }}
                                >
                                    Querformat
                                </button>
                            </div>
                        </div>

                        {/* Margins Selection */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                            <label style={{ fontSize: "0.85rem", color: "#94a3b8" }}>Seitenränder</label>
                            <select
                                value={margins}
                                onChange={(e) => setMargins(e.target.value as MarginSize)}
                                style={{
                                    background: "rgba(15, 23, 42, 0.6)",
                                    border: "1px solid var(--glass-border)",
                                    color: "#e2e8f0",
                                    padding: "0.5rem",
                                    borderRadius: "6px",
                                    outline: "none"
                                }}
                            >
                                <option value="normal">Normal (~2cm)</option>
                                <option value="narrow">Schmal (~1cm)</option>
                                <option value="wide">Breit (~3cm)</option>
                            </select>
                        </div>

                        <div style={{ flex: 1 }}></div>

                        {/* Action Area */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            <p style={{ fontSize: "0.8rem", color: "#64748b", margin: 0, lineHeight: 1.4 }}>
                                TIPP: Im nächsten nativen Dialog können Sie als Ziel "Als PDF speichern" auswählen.
                            </p>
                            <button
                                onClick={() => {
                                    onPrint();
                                }}
                                style={{
                                    background: "#0284c7",
                                    color: "white",
                                    border: "none",
                                    padding: "0.75rem",
                                    borderRadius: "8px",
                                    fontWeight: "600",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    gap: "0.5rem",
                                    cursor: "pointer",
                                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
                                }}
                            >
                                <Printer size={18} /> Drucken / PDF speichern
                            </button>
                        </div>
                    </div>

                    {/* RIGHT PANEL: PREVIEW */}
                    <div style={{
                        flex: 1,
                        background: "#0f172a",
                        padding: "2rem",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        overflow: "auto"
                    }}>
                        <div style={{
                            width: `${previewWidth}px`,
                            height: `${previewHeight}px`,
                            background: "white",
                            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)",
                            position: "relative",
                            overflow: "hidden", // clip content that spills out of our simulated page
                            transition: "all 0.3s ease-in-out"
                        }}>
                            {/* Inner Padding representing the selected margins */}
                            <div style={{
                                position: "absolute",
                                inset: margins === 'normal' ? '20px' : (margins === 'narrow' ? '10px' : '30px'),
                                border: "1px dashed #cbd5e1", // Subtle margin indicator
                                padding: "10px",
                                overflow: "hidden"
                            }}>
                                {/* The actual content that will be printed */}
                                <div className="print-preview-content" style={{
                                    transform: "scale(0.5)", // Scale down the real content to fit our small simulation box
                                    transformOrigin: "top left",
                                    width: "200%", // compensate for scale
                                    height: "200%",
                                    color: "black", // Force black text for preview
                                    fontSize: "12pt" // Typical print font size
                                }}>
                                    {previewContent}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
