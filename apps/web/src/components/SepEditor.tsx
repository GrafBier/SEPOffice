import { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import HighlightExtension from "@tiptap/extension-highlight";
import FontFamily from "@tiptap/extension-font-family";
import { Extension, Node, mergeAttributes, type Editor } from "@tiptap/core";
import { GhostText } from "./GhostText";
import { useAISettings } from "../contexts/AISettingsContext";
import { persistenceService } from "../services/persistenceService";
import * as aiSvc from "../services/aiService";
import {
    Bold,
    Italic,
    List,
    ListOrdered,
    Heading1,
    Heading2,
    Strikethrough,
    Quote, AlignLeft, AlignCenter, AlignRight, AlignJustify,
    Printer,
    Underline as UnderlineIcon,
    Highlighter,
    Sparkles,
    Download,
    Upload,
    Image as ImageIcon,
} from "lucide-react";
import { useReactToPrint } from "react-to-print";
import mammoth from "mammoth";
import JSZip from "jszip";
import generateDocx from 'html-to-docx';
// English comments / developer notes:
// - `html-to-docx` is used to export the editor HTML to a .docx file in-browser.
// - Difficulty encountered: `html-to-docx` pulls in modules that expect Node
//   built-ins (punycode, crypto, fs). During bundling with Vite this caused
//   missing file errors. To preserve client-side export we added a Vite
//   polyfill/alias workaround in `vite.config.ts` which maps the punycode
//   requests to the rollup-plugin polyfill file.
// - Decision rationale: Keeping DOCX export client-side provides a simpler UX
//   (no server), but requires bundling workarounds. If this becomes brittle,
//   consider moving export to a small server-side function or replacing the
//   library with a lightweight browser-first implementation.
import { EliotChat } from "./EliotChat";
import { PrintPreviewModal } from "./PrintPreviewModal";
import { ImageUploadModal } from "./ImageUploadModal";
import type { ImageDataPayload } from "./ImageUploadModal";
import { useTranslation } from "react-i18next";
const FontSize = Extension.create({
    name: "fontSize",
    addOptions() {
        return { types: ["textStyle"] };
    },
    addGlobalAttributes() {
        return [
            {
                types: this.options.types,
                attributes: {
                    fontSize: {
                        default: null,
                        parseHTML: (element) =>
                            element.style.fontSize.replace(/['"]+/g, ""),
                        renderHTML: (attributes) => {
                            if (!attributes.fontSize) {
                                return {};
                            }
                            return { style: `font-size: ${attributes.fontSize}` };
                        },
                    },
                },
            },
        ];
    },
});

const Figure = Node.create({
    name: 'figure',
    group: 'block',
    content: 'inline*',
    draggable: true,
    isolating: true,

    // Design note (EN): We created a custom `figure` node to better preserve
    // image metadata (src, alt, title) and alignment when converting between
    // editor HTML and exported formats. This helps with DOCX and PPTX exports
    // where alignment and captions matter.
    // Difficulty / solution: figure/figcaption rendering had to be explicit
    // to avoid losing alignment info during string-based conversions.
    addAttributes() {
        return {
            src: { default: null },
            alt: { default: null },
            title: { default: null },
            alignment: { default: 'center' }, // 'left', 'right', 'center'
        };
    },

    parseHTML() {
        return [
            {
                tag: 'figure',
                getAttrs: (node) => {
                    const img = (node as HTMLElement).querySelector('img');
                    return {
                        src: img?.getAttribute('src'),
                        alt: img?.getAttribute('alt'),
                        title: img?.getAttribute('title'),
                        alignment: (node as HTMLElement).getAttribute('data-alignment') || 'center',
                    }
                }
            },
        ]
    },

    // Render HTML intentionally includes inline styles to keep the exported
    // output predictable across consumers (browser preview, DOCX conversion).
    renderHTML({ HTMLAttributes }) {
        const { alignment, src, alt, title, ...rest } = HTMLAttributes;
        let style = "margin: 1rem auto; display: block; max-width: 100%; height: auto;"; // default center

        if (alignment === 'left') {
            style = "float: left; margin: 0 1.5rem 1rem 0; max-width: 50%; height: auto;";
        } else if (alignment === 'right') {
            style = "float: right; margin: 0 0 1rem 1.5rem; max-width: 50%; height: auto;";
        }

        return [
            'figure',
            mergeAttributes(rest, { style, 'data-alignment': alignment, class: 'editor-figure' }),
            ['img', { src, alt, title, style: "max-width: 100%; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);" }],
            ['figcaption', { style: "font-size: 0.85rem; color: #64748b; text-align: center; margin-top: 0.5rem; font-style: italic;" }, 0],
        ]
    },

});

const MenuBar = ({ editor, onOpenImageModal }: { editor: Editor | null; onOpenImageModal: () => void }) => {
    const { settings: aiSettings } = useAISettings();
    if (!editor) {
        return null;
    }

    return (
        <div className="toolbar fade-in">
            <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                disabled={!editor.can().chain().focus().toggleBold().run()}
                className={`toolbar-btn ${editor.isActive("bold") ? "is-active" : ""}`}
                title="Bold"
            >
                <Bold size={18} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                disabled={!editor.can().chain().focus().toggleItalic().run()}
                className={`toolbar-btn ${editor.isActive("italic") ? "is-active" : ""}`}
                title="Italic"
            >
                <Italic size={18} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleStrike().run()}
                disabled={!editor.can().chain().focus().toggleStrike().run()}
                className={`toolbar-btn ${editor.isActive("strike") ? "is-active" : ""}`}
                title="Strikethrough"
            >
                <Strikethrough size={18} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                disabled={!editor.can().chain().focus().toggleUnderline().run()}
                className={`toolbar-btn ${editor.isActive("underline") ? "is-active" : ""}`}
                title="Underline"
            >
                <UnderlineIcon size={18} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleHighlight().run()}
                disabled={!editor.can().chain().focus().toggleHighlight().run()}
                className={`toolbar-btn ${editor.isActive("highlight") ? "is-active" : ""}`}
                title="Highlight"
            >
                <Highlighter size={18} />
            </button>

            <div
                style={{
                    width: "1px",
                    background: "rgba(255,255,255,0.1)",
                    margin: "0 4px",
                }}
            />

            <select
                onChange={(e) =>
                    editor.chain().focus().setFontFamily(e.target.value).run()
                }
                value={editor.getAttributes("textStyle").fontFamily || ""}
                className="toolbar-select"
                title="Font Family"
            >
                <option value="">Default Font</option>
                <option value="Inter">Inter</option>
                <option value="Comic Sans MS, Comic Sans">Comic Sans</option>
                <option value="serif">Serif</option>
                <option value="monospace">Monospace</option>
            </select>

            <select
                onChange={(e) => {
                    editor.chain().focus().setMark("textStyle", { fontSize: e.target.value }).run();
                }}
                value={editor.getAttributes("textStyle").fontSize || ""}
                className="toolbar-select"
                title="Font Size"
            >
                <option value="">Default Size</option>
                <option value="12px">12px</option>
                <option value="14px">14px</option>
                <option value="16px">16px</option>
                <option value="20px">20px</option>
                <option value="24px">24px</option>
                <option value="32px">32px</option>
            </select>

            <div
                style={{
                    width: "1px",
                    background: "rgba(255,255,255,0.1)",
                    margin: "0 4px",
                }}
            />

            <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={`toolbar-btn ${editor.isActive("heading", { level: 1 }) ? "is-active" : ""}`}
                title="Heading 1"
            >
                <Heading1 size={18} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={`toolbar-btn ${editor.isActive("heading", { level: 2 }) ? "is-active" : ""}`}
                title="Heading 2"
            >
                <Heading2 size={18} />
            </button>

            <div
                style={{
                    width: "1px",
                    background: "rgba(255,255,255,0.1)",
                    margin: "0 4px",
                }}
            />

            <button
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`toolbar-btn ${editor.isActive("bulletList") ? "is-active" : ""}`}
                title="Bullet List"
            >
                <List size={18} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`toolbar-btn ${editor.isActive("orderedList") ? "is-active" : ""}`}
                title="Ordered List"
            >
                <ListOrdered size={18} />
            </button>
            <button
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={`toolbar-btn ${editor.isActive("blockquote") ? "is-active" : ""}`}
                title="Blockquote"
            >
                <Quote size={18} />
            </button>
            <div
                style={{
                    width: "1px",
                    background: "rgba(255,255,255,0.1)",
                    margin: "0 4px",
                }}
            />

            <button
                onClick={() => editor.chain().focus().setTextAlign("left").run()}
                className={`toolbar-btn ${editor.isActive({ textAlign: "left" }) ? "is-active" : ""}`}
                title="Align Left"
            >
                <AlignLeft size={18} />
            </button>
            <button
                onClick={() => editor.chain().focus().setTextAlign("center").run()}
                className={`toolbar-btn ${editor.isActive({ textAlign: "center" }) ? "is-active" : ""}`}
                title="Align Center"
            >
                <AlignCenter size={18} />
            </button>
            <button
                onClick={() => editor.chain().focus().setTextAlign("right").run()}
                className={`toolbar-btn ${editor.isActive({ textAlign: "right" }) ? "is-active" : ""}`}
                title="Align Right"
            >
                <AlignRight size={18} />
            </button>
            <button
                onClick={() => editor.chain().focus().setTextAlign("justify").run()}
                className={`toolbar-btn ${editor.isActive({ textAlign: "justify" }) ? "is-active" : ""}`}
                title="Justify"
            >
                <AlignJustify size={18} />
            </button>

            <div
                style={{
                    width: "1px",
                    background: "rgba(255,255,255,0.1)",
                    margin: "0 4px",
                }}
            />

            <input
                type="color"
                onInput={(event) =>
                    editor
                        .chain()
                        .focus()
                        .setColor((event.target as HTMLInputElement).value)
                        .run()
                }
                value={editor.getAttributes("textStyle").color || "#f8fafc"}
                style={{
                    width: "24px",
                    height: "24px",
                    padding: 0,
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    borderRadius: "50%",
                }}
                title="Text Color"
            />

            <div
                style={{
                    width: "1px",
                    background: "rgba(255,255,255,0.1)",
                    margin: "0 4px",
                }}
            />

            <button
                onClick={async () => {
                    const { from, to } = editor.state.selection;
                    const textToOptimize = editor.state.doc.textBetween(from, to, " ");
                    if (!textToOptimize) {
                        alert("Select text first!");
                        return;
                    }
                    try {
                        const originalHtml = editor.getHTML();
                        editor.commands.setContent(
                            originalHtml +
                            '<div id="optimizing-toast" style="position:fixed;top:20px;right:20px;background:#0284c7;color:white;padding:10px;border-radius:5px;z-index:999">Optimizing...</div>',
                        );
                        const optimized = await aiSvc.optimizeText(aiSettings, textToOptimize);
                        editor.commands.setContent(originalHtml);
                        if (optimized) {
                            editor
                                .chain()
                                .focus()
                                .insertContentAt({ from, to }, optimized)
                                .run();
                        }
                    } catch (e) {
                        editor.commands.setContent(
                            editor
                                .getHTML()
                                .replace(
                                    '<div id="optimizing-toast" style="position:fixed;top:20px;right:20px;background:#0284c7;color:white;padding:10px;border-radius:5px;z-index:999">Optimizing...</div>',
                                    "",
                                ),
                        );
                        console.error(e);
                    }
                }}
                className={`toolbar-btn`}
                title="Optimize Text (AI)"
            >
                <Sparkles size={18} color="#38bdf8" />
            </button>

            <div
                style={{
                    width: "1px",
                    background: "rgba(255,255,255,0.1)",
                    margin: "0 4px",
                }}
            />

            <button
                onClick={onOpenImageModal}
                className="toolbar-btn"
                title="Bild einfügen"
            >
                <ImageIcon size={18} />
            </button>
        </div>
    );
};

export default function SepEditor({ docId }: { docId?: string | null }) {
    const { t } = useTranslation();
    const editorRef = useRef<HTMLDivElement>(null);
    const importFileInputRef = useRef<HTMLInputElement>(null);
    const openFileInputRef = useRef<HTMLInputElement>(null);
    const [saveStatus, setSaveStatus] = useState("All changes saved");
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const saveTimeoutRef = useRef<number | null>(null);
    const [aiDocOpen, setAiDocOpen] = useState(false);
    const [aiDocPrompt, setAiDocPrompt] = useState("");
    const [isGeneratingDoc, setIsGeneratingDoc] = useState(false);
    const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);

    const [currentDocId, setCurrentDocId] = useState<string | null>(docId || null);
    const [docName, setDocName] = useState("Unbenanntes Dokument");

    // Sync docId from props (Roadmap A1)
    useEffect(() => {
        if (docId && docId !== currentDocId) {
            setCurrentDocId(docId);
        }
    }, [docId, currentDocId]);

    const { settings: aiSettings } = useAISettings();

    // Close menus when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setActiveMenu(null);
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Figure,
            TextAlign.configure({
                types: ["heading", "paragraph"],
            }),
            TextStyle,
            Color,
            HighlightExtension.configure({ multicolor: true }),
            FontFamily,
            FontSize,
            GhostText.configure({
                getSuggestion: async (text: string) => {
                    try {
                        return await aiSvc.completeText(aiSettings, text);
                    } catch (err) {
                        console.error(err);
                        return "";
                    }
                },
            }),
        ],
        content: ``,
        editorProps: {
            attributes: {
                spellcheck: "true",
                class: "editor-content-area",
            },
        },
        onUpdate: () => {
            setSaveStatus("Saving...");
        },
    });

    useEffect(() => {
        if (!editor) return;

        const loadContent = async () => {
            if (currentDocId) {
                const savedContent = await persistenceService.getDocContent(currentDocId);
                if (savedContent) {
                    editor.commands.setContent(savedContent);
                    const docs = await persistenceService.getRecentDocs();
                    const meta = docs.find(d => d.id === currentDocId);
                    if (meta) setDocName(meta.name);
                }
            } else {
                // New Document
                const newId = `write-${Date.now()}`;
                setCurrentDocId(newId);
                editor.commands.setContent(`<h1>Willkommen bei SEPWrite</h1><p>Beginnen Sie hier zu schreiben...</p>`);
                await persistenceService.saveDoc(newId, docName, 'write', editor.getHTML());
            }
        };
        loadContent();
    }, [editor, currentDocId]);

    // Auto-save logic
    useEffect(() => {
        if (!editor || !currentDocId) return;

        const updateHandler = () => {
            if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current);
            setSaveStatus("Saving...");
            saveTimeoutRef.current = window.setTimeout(async () => {
                const result = await persistenceService.saveDoc(currentDocId, docName, 'write', editor.getHTML());
                setSaveStatus(result.warning || "All changes saved");
            }, 1000) as unknown as number;
        };

        editor.on('update', updateHandler);
        return () => { editor.off('update', updateHandler); };
    }, [editor, currentDocId, docName]);

    const handlePrintOuter = useReactToPrint({
        contentRef: editorRef,
        documentTitle: "SEPWrite-Document",
    });

    const handleExportDocx = async () => {
        if (!editor) return;
        setSaveStatus("Exporting DOCX...");
        try {
            const html = editor.getHTML();
            const fullHtml = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>${docName}</title>
                </head>
                <body>
                    ${html}
                </body>
                </html>
            `;
            const docBuffer = await generateDocx(fullHtml, null, {
                title: docName,
                author: "SEPOffice",
            });
            const blob = new Blob([docBuffer], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${docName || 'Document'}.docx`;
            a.click();
            window.URL.revokeObjectURL(url);
            setSaveStatus("DOCX exported!");
        } catch (err) {
            console.error("DOCX export failed", err);
            setSaveStatus("Export failed");
        }
    };

    const handleNewDoc = () => {
        if (confirm("Neues Dokument erstellen? Alle nicht gespeicherten Änderungen gehen verloren.")) {
            editor?.commands.setContent(`<h1>Neues Dokument</h1><p>Beginnen Sie hier zu schreiben...</p>`);
            setSaveStatus("New document created");
        }
    };

    const handleOpenLocal = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !editor) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const content = event.target?.result as string;
                // Check if it's our sepw format (which is currently just HTML string in a file)
                // Or we could have a JSON wrapper
                editor.commands.setContent(content);
                setSaveStatus(`Opened: ${file.name}`);
            } catch (err) {
                console.error("Failed to open local file", err);
                alert("Fehler beim Öffnen der Datei.");
            }
        };
        reader.readAsText(file);
    };

    const handleSaveAs = () => {
        if (!editor) return;
        const html = editor.getHTML();
        const blob = new Blob([html], { type: "text/html" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "Document.sepw.html";
        a.click();
        window.URL.revokeObjectURL(url);
        setSaveStatus("Document saved to local filesystem");
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !editor) return;

        try {
            setSaveStatus("Importing...");
            if (file.name.endsWith(".docx")) {
                const arrayBuffer = await file.arrayBuffer();
                const result = await mammoth.convertToHtml({ arrayBuffer });
                editor.commands.setContent(result.value);
                setSaveStatus("Imported DOCX successfully");
            } else if (file.name.endsWith(".odt")) {
                const arrayBuffer = await file.arrayBuffer();
                const zip = await JSZip.loadAsync(arrayBuffer);
                const contentXml = await zip.file("content.xml")?.async("string");
                if (contentXml) {
                    // Extremely basic XML to HTML for ODT MVP
                    // In a real app, use a proper ODT parser
                    let html = contentXml
                        .replace(/<text:p[^>]*>/g, "<p>")
                        .replace(/<\/text:p>/g, "</p>")
                        .replace(/<text:h[^>]*>/g, "<h2>")
                        .replace(/<\/text:h>/g, "</h2>");

                    // Strip remaining XML tags
                    html = html.replace(/<[^>]+:[^>]+>/g, "");
                    editor.commands.setContent(html);
                    setSaveStatus("Imported ODT successfully");
                } else {
                    throw new Error("No content.xml found in ODT");
                }
            } else {
                alert("Unsupported file format. Please use .docx or .odt");
                setSaveStatus("Import failed");
            }
        } catch (err) {
            console.error("Import error:", err);
            alert("Failed to import document.");
            setSaveStatus("Import failed");
        } finally {
            if (importFileInputRef.current) importFileInputRef.current.value = "";
        }
    };

    const handleAiGenerateDoc = async () => {
        if (!aiDocPrompt.trim() || !editor) return;
        setIsGeneratingDoc(true);
        try {
            const html = await aiSvc.generateDocument(aiSettings, aiDocPrompt);
            if (html) {
                editor.commands.setContent(html);
                setSaveStatus("KI-Dokument erstellt!");
            }
        } catch (err) {
            console.error(err);
            alert("KI konnte das Dokument nicht erstellen.");
        } finally {
            setIsGeneratingDoc(false);
            setAiDocOpen(false);
            setAiDocPrompt("");
        }
    };

    return (
        <div className="editor-wrapper fade-in">
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
                    width: "100%",
                    maxWidth: "800px",
                }}
            >
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
                                        handleNewDoc();
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
                                    <Upload size={14} /> {t('open')}... (.sepw)
                                </button>
                                <input
                                    type="file"
                                    accept=".sepw.html"
                                    ref={openFileInputRef}
                                    onChange={handleOpenLocal}
                                    style={{ display: "none" }}
                                />
                                <div className="dropdown-divider"></div>
                                <button
                                    onClick={() => {
                                        handleSaveAs();
                                        setActiveMenu(null);
                                    }}
                                >
                                    <Download size={14} /> {t('save')}
                                </button>
                                <button
                                    onClick={() => {
                                        handleSaveAs();
                                        setActiveMenu(null);
                                    }}
                                >
                                    <Download size={14} /> Speichern Unter... (.sepw)
                                </button>
                                <div className="dropdown-divider"></div>
                                <button
                                    onClick={() => {
                                        importFileInputRef.current?.click();
                                        setActiveMenu(null);
                                    }}
                                >
                                    <Upload size={14} /> Importieren (.docx, .odt)
                                </button>
                                <input
                                    type="file"
                                    accept=".docx,.odt"
                                    ref={importFileInputRef}
                                    onChange={handleImport}
                                    style={{ display: "none" }}
                                />
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
                                        handleExportDocx();
                                        setActiveMenu(null);
                                    }}
                                >
                                    <Download size={14} /> Exportieren (.docx)
                                </button>
                                <div className="dropdown-divider"></div>
                                <button
                                    onClick={() => {
                                        setAiDocOpen(true);
                                        setActiveMenu(null);
                                    }}
                                >
                                    <Sparkles size={14} color="#38bdf8" /> KI: Dokument erstellen...
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ marginLeft: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                        type="text"
                        value={docName}
                        onChange={(e) => setDocName(e.target.value)}
                        onBlur={() => {
                            if (currentDocId && editor) {
                                persistenceService.saveDoc(currentDocId, docName, 'write', editor.getHTML());
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
                        placeholder="Unbenanntes Dokument"
                    />
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <span style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
                        {saveStatus}
                    </span>
                </div>
            </div>

            <div className="editor-container">
                <MenuBar editor={editor} onOpenImageModal={() => setIsImageModalOpen(true)} />
                <div ref={editorRef} className="print-container">
                    <EditorContent editor={editor} />
                </div>
            </div>

            {/* AI Document Generation Modal */}
            {aiDocOpen && (
                <div className="settings-overlay" onClick={() => { setAiDocOpen(false); setAiDocPrompt(""); }}>
                    <div className="settings-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "500px" }}>
                        <div className="settings-header">
                            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                <Sparkles size={20} color="#38bdf8" />
                                <h2 style={{ background: "linear-gradient(to right, #38bdf8, #818cf8)", backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>KI: Dokument erstellen</h2>
                            </div>
                        </div>
                        <div className="settings-content">
                            <p style={{ color: "#94a3b8", fontSize: "0.9rem", marginBottom: "1rem" }}>
                                Beschreibe das Dokument, das du benötigst. Die KI erstellt ein vollständig formatiertes Dokument.
                            </p>
                            <textarea
                                autoFocus
                                value={aiDocPrompt}
                                onChange={(e) => setAiDocPrompt(e.target.value)}
                                placeholder="z.B. Erstelle eine professionelle Rechnung für die Firma XY mit 3 Positionen..."
                                style={{
                                    width: "100%",
                                    height: "120px",
                                    padding: "0.75rem",
                                    background: "rgba(15, 23, 42, 0.5)",
                                    border: "1px solid var(--glass-border)",
                                    borderRadius: "8px",
                                    color: "#e2e8f0",
                                    fontSize: "0.95rem",
                                    resize: "none",
                                    outline: "none",
                                    boxSizing: "border-box",
                                }}
                            />
                        </div>
                        <div className="settings-footer">
                            <button className="settings-reset-btn" onClick={() => { setAiDocOpen(false); setAiDocPrompt(""); }}>
                                Abbrechen
                            </button>
                            <button className="settings-save-btn" onClick={handleAiGenerateDoc} disabled={isGeneratingDoc}>
                                {isGeneratingDoc ? "Erstelle..." : "✨ Erstellen"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Eliot AI Chat Integration */}
            <EliotChat
                contextData={editor?.getText() || ""}
                contextType="document"
            />

            {/* Print Preview Modal */}
            <PrintPreviewModal
                isOpen={isPrintModalOpen}
                onClose={() => setIsPrintModalOpen(false)}
                onPrint={() => {
                    setIsPrintModalOpen(false);
                    setTimeout(() => {
                        handlePrintOuter();
                    }, 100); // slight delay to ensure modal is closed and styles are applied
                }}
                previewContent={
                    <div
                        className="ProseMirror"
                        dangerouslySetInnerHTML={{ __html: editor?.getHTML() || "" }}
                        style={{ padding: "0" }}
                    />
                }
            />

            <ImageUploadModal
                isOpen={isImageModalOpen}
                onClose={() => setIsImageModalOpen(false)}
                showAlignment={true}
                onInsert={(data: ImageDataPayload) => {
                    if (editor) {
                        insertFigureNode(editor, data);
                    }
                }}
            />
        </div>
    );
}

const insertFigureNode = (editorInstance: Editor, data: ImageDataPayload) => {
    editorInstance
        .chain()
        .focus()
        .insertContent({
            type: "figure",
            attrs: { src: data.src, alignment: data.alignment || "center" },
            content: data.caption ? [{ type: "text", text: data.caption }] : [],
        })
        .run();
};
