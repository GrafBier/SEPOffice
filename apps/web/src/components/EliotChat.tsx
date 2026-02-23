import React, { useState, useRef, useEffect } from "react";
import { X, Send, Sparkles, Bot } from "lucide-react";
import { useAISettings } from "../contexts/AISettingsContext";
import * as aiSvc from "../services/aiService";
import ReactMarkdown from "react-markdown";

/**
 * EliotChat provides a small RAG-style chat widget (Eliot).
 * Now supports document actions via <action name="...">JSON</action> blocks.
 */
interface Message {
    id: string;
    role: "user" | "ai";
    content: string;
}

interface EliotChatProps {
    contextData: string; // The RAG context (document text or grid CSV)
    contextType: "document" | "spreadsheet" | "presentation";
    onAction?: (actionName: string, args: any) => void;
}

export const EliotChat: React.FC<EliotChatProps> = ({ contextData, contextType, onAction }) => {
    const { settings: aiSettings, status, progress, lastError, startAI } = useAISettings();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            role: "ai",
            content: `Hallo! Ich bin **Eliot**, dein KI-Assistent. Wie kann ich dir bei deinem ${contextType === "document" ? "Dokument" : contextType === "spreadsheet" ? "Tabellenblatt" : "Präsentation"} helfen?`
        }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg: Message = { id: Date.now().toString(), role: "user", content: input.trim() };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);

        try {
            const systemPrompt = `Du bist Eliot, ein intelligenter KI-Assistent in SEPOffice.
Der Nutzer arbeitet an einem ${contextType}.
Inhalt:
${contextData}

${onAction ? `Du kannst Aktionen ausführen:
<action name="NAME">JSON</action>

${contextType === 'spreadsheet' ? `Tabellen-Aktionen:
- add_sheet: {"name": "Blattname"}
- select_sheet: {"name": "Blattname"} 
- rename_sheet: {"newName": "Neu"}
- update_values: {"startCell": "A1", "values": [["X","Y"]], "sheetName": "Tabelle1"}
- format_cells: {"range": "A1:B2", "style": {"bold": true}, "sheetName": "Tabelle1"}` :
                        contextType === 'presentation' ? `Präsentations-Aktionen:
- add_slide: {"layout": "bullet", "title": "Titel"}
- update_current_slide: {"elements": [...]}` :
                            `Text-Aktionen:
- insert_text: {"text": "..."}
- replace_content: {"html": "..."}`}` : ''}

Beantworte Nutzerfragen freundlich mit Markdown.`;

            const history = messages.slice(-6).map(m => ({ role: m.role, content: m.content }));
            const response = await aiSvc.chatCompletion(
                aiSettings,
                [
                    { role: "system", content: systemPrompt },
                    ...history,
                    { role: "user", content: userMsg.content }
                ]
            );
            let finalContent = aiSvc.completionToText(response) || "Fehler.";

            if (onAction) {
                const actionRegex = /<action\s+name="([^"]+)">([\s\S]*?)<\/action>/g;
                let match;
                while ((match = actionRegex.exec(finalContent)) !== null) {
                    try { onAction(match[1], JSON.parse(match[2])); } catch (e) { console.error(e); }
                }
                finalContent = finalContent.replace(actionRegex, "").trim();
            }

            setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: "ai", content: finalContent || "(Aktion ausgeführt)" }]);
        } catch (err) {
            setMessages(prev => [...prev, { id: Date.now().toString(), role: "ai", content: "🚨 Fehler!" }]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) { 
        let fabIcon = <Bot size={24} />;
        let fabClass = "eliot-fab";
        if (aiSettings.provider === "local") {
             if (status === "loading") {
                 fabIcon = <Sparkles size={24} className="spin" />;
                 fabClass += " loading";
             } else if (status === "error" || status === "uninitialized") {
                 fabIcon = <X size={24} color="red" />;
                 fabClass += " error";
             }
        }
        return <button className={fabClass} onClick={() => setIsOpen(true)} title="Eliot Chat">{fabIcon}</button>;
    }

    // AI Status Overlay for Local Provider
    if (aiSettings.provider === "local" && status !== "ok") {
        return (
            <div className="eliot-widget open">
                <div className="eliot-header">
                    <div className="eliot-title"><Sparkles size={18} color="#38bdf8" /> Eliot Chat</div>
                    <button className="eliot-close" onClick={() => setIsOpen(false)}><X size={20} /></button>
                </div>
                <div className="eliot-status-screen" style={{ padding: "2rem", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", textAlign: "center", gap: "1rem" }}>
                    {status === "loading" ? (
                        <>
                            <div className="spinner" style={{ animation: "spin 1s linear infinite" }}><Sparkles size={48} color="#38bdf8" /></div>
                            <h3>AI Service lädt...</h3>
                            <div className="progress-bar-container" style={{ width: "100%", height: "8px", background: "#e2e8f0", borderRadius: "4px", overflow: "hidden" }}>
                                <div className="progress-fill" style={{ width: `${progress}%`, height: "100%", background: "#38bdf8", transition: "width 0.3s ease" }}></div>
                            </div>
                            <p style={{ fontSize: "0.9rem", color: "#64748b" }}>{progress}% - Bitte warten</p>
                        </>
                    ) : (
                        <>
                            <Bot size={48} color="#94a3b8" />
                            <h3>AI Service nicht bereit</h3>
                            <p style={{ fontSize: "0.9rem", color: "#64748b", margin: "0.5rem 0" }}>
                                {lastError ? `Fehler: ${lastError}` : "Der lokale AI Service läuft nicht."}
                            </p>
                            <button 
                                onClick={startAI}
                                style={{ background: "#38bdf8", color: "white", padding: "0.5rem 1rem", borderRadius: "0.5rem", border: "none", cursor: "pointer", fontWeight: "bold" }}
                            >
                                AI Service starten
                            </button>
                        </>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="eliot-widget open">
            <div className="eliot-header">
                <div className="eliot-title"><Sparkles size={18} color="#38bdf8" /> Eliot Chat</div>
                <button className="eliot-close" onClick={() => setIsOpen(false)}><X size={20} /></button>
            </div>
            <div className="eliot-messages">
                {messages.map((msg, i) => (
                    <div key={i} className={`eliot-message ${msg.role}`}>
                        {msg.role === "ai" ? <ReactMarkdown>{msg.content}</ReactMarkdown> : msg.content}
                    </div>
                ))}
                {isLoading && <div className="eliot-message ai">Denkt nach...</div>}
                <div ref={messagesEndRef} />
            </div>
            <div className="eliot-input-container">
                <textarea 
                    className="eliot-input" 
                    placeholder="Frag Eliot..." 
                    value={input} 
                    onChange={(e) => setInput(e.target.value)} 
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }} 
                    disabled={isLoading} 
                />
                <button className="eliot-send" onClick={handleSend} disabled={!input.trim() || isLoading}><Send size={18} /></button>
            </div>
        </div>
    );
};
