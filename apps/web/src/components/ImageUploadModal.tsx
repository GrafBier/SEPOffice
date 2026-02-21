import React, { useState, useRef } from 'react';
import { X, Image as ImageIcon, Upload, Sparkles, AlertTriangle, Wand2 } from 'lucide-react';
import { useAISettings } from '../contexts/AISettingsContext';
import * as aiSvc from '../services/aiService';

export type ImageAlignment = 'left' | 'right' | 'center';

export interface ImageDataPayload {
    src: string;
    alignment: ImageAlignment;
    caption?: string;
    isGeneratingCaption: boolean;
}

interface ImageUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onInsert: (data: ImageDataPayload) => void;
    showAlignment?: boolean; // When true the modal exposes alignment controls (used in SEPWrite). When false (SEPGrid) alignment is not shown because images are placed freely.
}

export const ImageUploadModal: React.FC<ImageUploadModalProps> = ({
    isOpen,
    onClose,
    onInsert,
    showAlignment = true
}) => {
    const { settings: aiSettings } = useAISettings();
    const [activeTab, setActiveTab] = useState<'url' | 'upload'>('url');
    const [url, setUrl] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [previewSrc, setPreviewSrc] = useState<string | null>(null);
    const [alignment, setAlignment] = useState<ImageAlignment>('center');

    const [useAI, setUseAI] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (selected) {
            setFile(selected);
            const reader = new FileReader();
            reader.onload = (event) => setPreviewSrc(event.target?.result as string);
            reader.readAsDataURL(selected);
        }
    };

    const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setUrl(val);
        setPreviewSrc(val);
    };

    const handleInsert = async () => {
        if (!previewSrc) return;

        let finalCaption = "";

        if (useAI) {
            setIsGenerating(true);
            const imageName = activeTab === 'upload' && file ? file.name : (url.split('/').pop() || 'Unbekanntes Bild');

            // Call the AI Service to hallucinate/research a caption
            finalCaption = await aiSvc.generateImageSource(aiSettings, imageName, activeTab === 'url' ? url : undefined);
            setIsGenerating(false);
        }

        onInsert({
            src: previewSrc,
            alignment,
            caption: finalCaption,
            isGeneratingCaption: useAI
        });

        resetAndClose();
    };

    const resetAndClose = () => {
        setUrl('');
        setFile(null);
        setPreviewSrc(null);
        setUseAI(false);
        setAlignment('center');
        setIsGenerating(false);
        onClose();
    };

    const isValid = activeTab === 'url' ? url.length > 0 : file !== null;

    return (
        <div style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.8)",
            backdropFilter: "blur(4px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 10000,
        }}>
            <div style={{
                background: "rgba(30, 41, 59, 0.95)",
                border: "1px solid var(--glass-border)",
                borderRadius: "12px",
                width: "90vw",
                maxWidth: "500px",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden"
            }}>
                {/* Header */}
                <div style={{
                    padding: "1rem 1.5rem",
                    borderBottom: "1px solid var(--glass-border)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    background: "rgba(15, 23, 42, 0.4)"
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#e2e8f0", fontWeight: "600" }}>
                        <ImageIcon size={18} color="#38bdf8" /> Bild einfügen
                    </div>
                    <button onClick={resetAndClose} style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer" }}>
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>

                    {/* Tabs */}
                    <div style={{ display: "flex", background: "rgba(15, 23, 42, 0.5)", padding: "0.25rem", borderRadius: "8px" }}>
                        <button
                            onClick={() => setActiveTab('url')}
                            style={{
                                flex: 1, padding: "0.5rem", background: activeTab === 'url' ? "#38bdf8" : "transparent",
                                color: activeTab === 'url' ? "#0f172a" : "#e2e8f0", border: "none", borderRadius: "6px",
                                fontWeight: activeTab === 'url' ? "600" : "400", cursor: "pointer", transition: "all 0.2s"
                            }}
                        >
                            Web-URL
                        </button>
                        <button
                            onClick={() => setActiveTab('upload')}
                            style={{
                                flex: 1, padding: "0.5rem", background: activeTab === 'upload' ? "#38bdf8" : "transparent",
                                color: activeTab === 'upload' ? "#0f172a" : "#e2e8f0", border: "none", borderRadius: "6px",
                                fontWeight: activeTab === 'upload' ? "600" : "400", cursor: "pointer", transition: "all 0.2s"
                            }}
                        >
                            Upload
                        </button>
                    </div>

                    {/* Input Area */}
                    {activeTab === 'url' ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                            <label style={{ fontSize: "0.85rem", color: "#94a3b8" }}>Bild URL (https://...)</label>
                            <input
                                type="url"
                                value={url}
                                onChange={handleUrlChange}
                                placeholder="https://example.com/image.png"
                                style={{
                                    background: "rgba(15, 23, 42, 0.6)", border: "1px solid var(--glass-border)",
                                    color: "#e2e8f0", padding: "0.75rem", borderRadius: "6px", outline: "none"
                                }}
                            />
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                            <label style={{ fontSize: "0.85rem", color: "#94a3b8" }}>Lokale Datei</label>
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                style={{
                                    border: "2px dashed var(--glass-border)", borderRadius: "8px", padding: "2rem",
                                    display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem",
                                    cursor: "pointer", background: "rgba(15, 23, 42, 0.3)", transition: "all 0.2s"
                                }}
                            >
                                <Upload size={24} color="#94a3b8" />
                                <span style={{ color: "#e2e8f0", fontSize: "0.9rem" }}>
                                    {file ? file.name : "Klicken, um Bild auszuwählen"}
                                </span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    style={{ display: "none" }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Preview Area (Small) */}
                    {previewSrc && (
                        <div style={{
                            height: "120px", background: "#0f172a", borderRadius: "8px", overflow: "hidden",
                            display: "flex", justifyContent: "center", alignItems: "center", border: "1px solid var(--glass-border)"
                        }}>
                            <img src={previewSrc} alt="Preview" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                        </div>
                    )}

                    {/* Alignment (Only for SEPWrite) */}
                    {showAlignment && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                            <label style={{ fontSize: "0.85rem", color: "#94a3b8" }}>Layout & Textumfluss</label>
                            <div style={{ display: "flex", gap: "0.5rem" }}>
                                {(['left', 'center', 'right'] as ImageAlignment[]).map(pos => (
                                    <button
                                        key={pos}
                                        onClick={() => setAlignment(pos)}
                                        style={{
                                            flex: 1, padding: "0.5rem", background: alignment === pos ? "rgba(56, 189, 248, 0.2)" : "rgba(15, 23, 42, 0.6)",
                                            border: `1px solid ${alignment === pos ? "#38bdf8" : "var(--glass-border)"}`,
                                            color: alignment === pos ? "#38bdf8" : "#94a3b8", borderRadius: "6px", cursor: "pointer",
                                            textTransform: "capitalize"
                                        }}
                                    >
                                        {pos === 'left' ? 'Links' : pos === 'right' ? 'Rechts' : 'Zentriert'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* AI Feature Toggle */}
                    <div style={{
                        background: useAI ? "rgba(16, 185, 129, 0.1)" : "rgba(15, 23, 42, 0.4)",
                        border: `1px solid ${useAI ? "rgba(16, 185, 129, 0.3)" : "var(--glass-border)"}`,
                        borderRadius: "8px", padding: "1rem"
                    }}>
                        <label style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", cursor: "pointer" }}>
                            <input
                                type="checkbox"
                                checked={useAI}
                                onChange={(e) => setUseAI(e.target.checked)}
                                style={{ marginTop: "4px" }}
                            />
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                                <div style={{ color: useAI ? "#10b981" : "#e2e8f0", fontWeight: "500", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                    <Sparkles size={14} /> KI-Quellenrecherche & Caption aktivieren
                                </div>
                                <div style={{ fontSize: "0.8rem", color: "#94a3b8", lineHeight: 1.4, display: "flex", gap: "0.25rem", alignItems: "flex-start" }}>
                                    <AlertTriangle size={12} style={{ flexShrink: 0, marginTop: "2px", color: "#fbbf24" }} />
                                    Achtung: Die KI recherchiert im Web oder halluziniert eine Bildunterschrift anhand des Dateinamens. Die Quellenangabe ist nicht zwingend fehlerfrei!
                                </div>
                            </div>
                        </label>
                    </div>

                    {/* Action */}
                    <button
                        onClick={handleInsert}
                        disabled={!isValid || isGenerating}
                        style={{
                            background: isValid && !isGenerating ? "#0284c7" : "rgba(2, 132, 199, 0.5)",
                            color: "white", padding: "0.75rem", borderRadius: "8px", border: "none",
                            fontWeight: "600", cursor: isValid && !isGenerating ? "pointer" : "not-allowed",
                            display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem",
                            marginTop: "0.5rem"
                        }}
                    >
                        {isGenerating ? (
                            <>
                                <Wand2 size={18} className="spin" /> KI generiert Quelle...
                            </>
                        ) : (
                            "Bild einfügen"
                        )}
                    </button>

                </div>
            </div>
        </div>
    );
};
