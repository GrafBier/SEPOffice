import React, { useState, useRef, useEffect } from "react";
import { X, Send, Sparkles, Bot } from "lucide-react";
import { useAISettings } from "../contexts/AISettingsContext";
import * as aiSvc from "../services/aiService";
import ReactMarkdown from "react-markdown";

/**
 * EliotChat notes:
 * - This component provides a small RAG-style chat widget (Eliot) used for quick
 *   question/answer workflows against the currently open document or sheet.
 * - We currently implement a lightweight "chat history as text" workaround: the
 *   UI sends a single combined string (systemPrompt + chat history + current query)
 *   to `aiSvc.completeText()` because the service abstraction currently accepts
 *   only a single `userMessage` and `systemPrompt`. This is intentional to keep
 *   the client-side code simple; servers or future provider adapters should
 *   accept structured message arrays for better fidelity.
 * - Keep messages small: the RAG context (`contextData`) can be large; consider
 *   truncating or summarizing long documents before sending to the model.
 */
interface Message {
    id: string;
    role: "user" | "ai";
    content: string;
}

interface EliotChatProps {
    contextData: string; // The RAG context (document text or grid CSV)
    contextType: "document" | "spreadsheet";
}

export const EliotChat: React.FC<EliotChatProps> = ({ contextData, contextType }) => {
    const { settings: aiSettings } = useAISettings();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            role: "ai",
            content: `Hallo! Ich bin **Eliot**, dein KI-Assistent. Wie kann ich dir bei deinem ${contextType === "document" ? "Dokument" : "Tabellenblatt"} helfen?`
        }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input.trim()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            // Build the RAG System Prompt
            const systemPrompt = `Du bist Eliot, ein intelligenter und hilfreicher KI-Assistent integriert in SEPOffice.
Der Nutzer arbeitet gerade an einem ${contextType === "document" ? "Textdokument" : "Tabellenblatt"}.
Hier ist der AKTUELLE INHALT der Datei als Kontext, auf den du dich beziehen sollst, wenn der Nutzer fachliche Fragen stellt:

--- START KONTEXT ---
${contextData}
--- ENDE KONTEXT ---

Beantworte die Fragen des Nutzers präzise, freundlich und basierend auf diesem Kontext. Wenn die Frage nichts mit dem Kontext zu tun hat, beantworte sie normal.
Formatiere deine Antworten sauber mit Markdown (Fett, Listen, Codeblöcke etc.).`;

            // We send the entire chat history so Eliot has short-term memory
            const chatHistoryText = messages.map(m => `${m.role === 'user' ? 'Nutzer' : 'Eliot'}: ${m.content}`).join("\n\n");
            const fullQuery = `Bisheriger Chatverlauf:\n${chatHistoryText}\n\nAktuelle Frage des Nutzers:\n${userMessage.content}`;

            // Use the existing chatCompletion (it handles the different LLM providers like Local, Groq, OpenAI)
            const mockSettings = { ...aiSettings };

            // Call the AI Service
            // We pass the RAG prompt as system prompt, and the chat history + current query as userMessage
            // Note: We are using a hacky approach to send chat history because chatCompletion only takes systemPrompt and userMessage currently.
            // In a real production app, chatCompletion should accept a full message array.
            const response = await aiSvc.completeText(mockSettings, `${systemPrompt}\n\n${fullQuery}`);

            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "ai",
                content: response || "Entschuldigung, ich konnte keine Antwort generieren."
            };

            setMessages(prev => [...prev, aiMessage]);

        } catch (err) {
            console.error("Eliot Chat Error:", err);
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: "ai",
                content: "🚨 Es gab einen Fehler bei der Verbindung zur KI. Bitte überprüfe die Einstellungen."
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <>
            <button
                className={`eliot-fab ${isOpen ? "hidden" : ""}`}
                onClick={() => setIsOpen(true)}
                title="Eliot KI-Chat öffnen"
            >
                <Bot size={24} />
            </button>

            <div className={`eliot-widget ${isOpen ? "open" : ""}`}>
                <div className="eliot-header">
                    <div className="eliot-title">
                        <Sparkles size={18} color="#38bdf8" />
                        Eliot Chat
                    </div>
                    <button className="eliot-close" onClick={() => setIsOpen(false)}>
                        <X size={20} />
                    </button>
                </div>

                <div className="eliot-messages">
                    {messages.map(msg => (
                        <div key={msg.id} className={`eliot-message ${msg.role}`}>
                            {msg.role === "ai" ? (
                                <ReactMarkdown>{msg.content}</ReactMarkdown>
                            ) : (
                                msg.content
                            )}
                        </div>
                    ))}
                    {isLoading && (
                        <div className="eliot-message ai">
                            <span className="spin" style={{ display: "inline-block" }}><Bot size={16} /></span> Denkt nach...
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="eliot-input-container">
                    <textarea
                        className="eliot-input"
                        placeholder="Frag Eliot etwas zum Dokument..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isLoading}
                    />
                    <button
                        className="eliot-send"
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>
        </>
    );
};
