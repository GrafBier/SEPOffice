/**
 * AI Service Layer – Universal LLM Provider Routing
 * Supports: Local Python, Groq, OpenAI, Ollama, LMStudio, Jan.AI
 */

export type AIProvider = "local" | "groq" | "openai" | "ollama" | "lmstudio" | "janai";

export interface AISettings {
    provider: AIProvider;
    apiKey: string;
    baseUrl: string;
    model: string;
    temperature: number;
    vibeWriting: boolean;
}

export const DEFAULT_SETTINGS: AISettings = {
    provider: "local",
    apiKey: "",
    baseUrl: "http://localhost:8080",
    model: "",
    temperature: 0.7,
    vibeWriting: true,
};

export const PROVIDER_DEFAULTS: Record<AIProvider, { baseUrl: string; models: string[]; needsApiKey: boolean; label: string }> = {
    local: {
        baseUrl: "http://localhost:8080",
        models: ["Qwen2.5-0.5B (lokal)"],
        needsApiKey: false,
        label: "Lokaler Python-Service",
    },
    groq: {
        baseUrl: "https://api.groq.com/openai/v1",
        models: ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768", "gemma2-9b-it"],
        needsApiKey: true,
        label: "Groq Cloud",
    },
    openai: {
        baseUrl: "https://api.openai.com/v1",
        models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"],
        needsApiKey: true,
        label: "OpenAI",
    },
    ollama: {
        baseUrl: "http://localhost:11434",
        models: ["llama3.1", "mistral", "codellama", "gemma2"],
        needsApiKey: false,
        label: "Ollama (Lokal)",
    },
    lmstudio: {
        baseUrl: "http://localhost:1234/v1",
        models: ["Geladenes Modell"],
        needsApiKey: false,
        label: "LM Studio (Lokal)",
    },
    janai: {
        baseUrl: "http://localhost:1337/v1",
        models: ["Geladenes Modell"],
        needsApiKey: false,
        label: "Jan.AI (Lokal)",
    },
};

interface JsonSchemaProperty {
    type: string;
    description?: string;
    enum?: string[];
    properties?: Record<string, JsonSchemaProperty>;
    items?: JsonSchemaProperty;
}

interface AiToolFunction {
    name: string;
    description: string;
    parameters: {
        type: "object";
        properties: Record<string, JsonSchemaProperty>;
        required?: string[];
    };
}

interface AiToolDefinition {
    type: "function";
    function: AiToolFunction;
}

interface AiToolCall {
    function: {
        name: string;
        arguments?: string;
    };
}

type ChatCompletionResponse = string | AiToolCall[];
type ChatCompletionTools = AiToolDefinition[];

type GridActionResult =
    | { type: "raw_data"; data: string[][] | null }
    | { type: "tools"; calls: AiToolCall[] }
    | null;

interface OpenAIRequestMessage {
    role: "system" | "user" | "assistant";
    content: string;
}

interface OpenAIRequestBody {
    model: string;
    messages: OpenAIRequestMessage[];
    temperature: number;
    tools?: ChatCompletionTools;
    tool_choice?: "auto";
    stream?: boolean;
}

interface OpenAICompletionResponse {
    choices?: Array<{
        message?: {
            content?: string;
            tool_calls?: AiToolCall[];
        };
    }>;
    message?: {
        content?: string;
    };
}

export const completionToText = (value: ChatCompletionResponse): string => {
    if (Array.isArray(value)) {
        return value.map((call) => call.function.arguments ?? "").join("\n");
    }
    return value || "";
};

// ── Core Chat Completion ──────────────────────────────────────────────

export async function chatCompletion(settings: AISettings, messages: { role: string; content: string }[], tools?: ChatCompletionTools): Promise<ChatCompletionResponse> {
    if (settings.provider === "local") {
        // Try the dedicated chat endpoint first, fall back to legacy completion
        try {
            const res = await fetchWithTimeout(`${settings.baseUrl}/api/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages, max_new_tokens: 1024, temperature: settings.temperature }),
            });
            if (res.ok) {
                const json = await res.json() as OpenAICompletionResponse;
                return json.choices?.[0]?.message?.content || "";
            }
            // Fallback to legacy /api/complete if /api/chat not available
        } catch { /* fallback */ }
        
        const prompt = messages.map(m => `${m.role === 'user' ? 'User' : m.role === 'system' ? 'System' : 'Assistant'}: ${m.content}`).join("\n\n");
        return localCompletion(settings, "", prompt);
    }
    // OpenAI-compatible API (Groq, OpenAI, LMStudio, Jan.AI, Ollama /v1)
    return openaiCompatibleCompletion(settings, messages, tools);
}



async function localCompletion(settings: AISettings, systemPrompt: string, userMessage: string): Promise<string> {
    const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${userMessage}` : userMessage;
    const res = await fetchWithTimeout(`${settings.baseUrl}/api/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Local python service expects "text" field
        body: JSON.stringify({ text: fullPrompt, max_new_tokens: 1024 }),
    });
    const json = await res.json();
    return json.completion || "";
}

const DEFAULT_TIMEOUT = 60000; // 60 seconds

async function fetchWithTimeout(url: string, options: RequestInit, timeout = DEFAULT_TIMEOUT) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
        const response = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(id);
        return response;
    } catch (e) {
        clearTimeout(id);
        if (e instanceof Error && e.name === 'AbortError') {
            throw new Error(`AI Request timed out after ${timeout / 1000}s`);
        }
        throw e;
    }
}

async function openaiCompatibleCompletion(settings: AISettings, messages: { role: string; content: string }[], tools?: ChatCompletionTools): Promise<ChatCompletionResponse> {
    const endpoint = settings.provider === "ollama"
        ? `${settings.baseUrl}/api/chat`
        : `${settings.baseUrl}/chat/completions`;

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (settings.apiKey) {
        headers["Authorization"] = `Bearer ${settings.apiKey}`;
    }

    // Map roles to standard OpenAI roles
    const apiMessages = messages.map(m => ({
        role: m.role as "system" | "user" | "assistant",
        content: m.content
    }));

    const body: OpenAIRequestBody = {
        model: settings.model || PROVIDER_DEFAULTS[settings.provider].models[0],
        messages: apiMessages,
        temperature: settings.temperature,
    };

    if (tools && tools.length > 0) {
        body.tools = tools;
        body.tool_choice = "auto";
    }

    if (settings.provider === "ollama") {
        body.stream = false;
    }

    const res = await fetchWithTimeout(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`AI Provider error (${res.status}): ${errorText}`);
    }

    const json = (await res.json()) as OpenAICompletionResponse;

    // Ollama has a different response shape or doesn't fully support tools yet
    if (settings.provider === "ollama") {
        return json.message?.content || "";
    }

    const responseMessage = json.choices?.[0]?.message;
    if (!responseMessage) return "";

    // Return tool calls if present, otherwise text content
    if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
        return responseMessage.tool_calls;
    }

    return responseMessage.content || "";
}

// ── Specialized AI Methods ────────────────────────────────────────────

export async function generateFormula(settings: AISettings, query: string): Promise<string> {
    if (settings.provider === "local") {
        const res = await fetchWithTimeout(`${settings.baseUrl}/api/formula`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query }),
        });
        const json = await res.json();
        return json.formula || "";
    }

    const result = completionToText(
        await chatCompletion(
            settings,
            [{ role: "system", content: `Du bist ein Excel-Formel-Experte. Gib NUR die Formel zurück, ohne Erklärung. Die Formel muss mit = beginnen. 
Verwende englische Funktionsnamen: SUM, AVERAGE, COUNT, MAX, MIN, IF, VLOOKUP, HLOOKUP, INDEX, MATCH, ROUND, CONCATENATE, LEFT, RIGHT, MID, LEN, TRIM, UPPER, LOWER, TODAY, NOW, YEAR, MONTH, DAY, DATE, ABS, SQRT, POWER, MOD, INT, COUNTIF, SUMIF, AVERAGEIF, AND, OR, NOT, TRUE, FALSE, IFERROR, ISBLANK, ISERROR, ISTEXT, ISNUMBER.
Verwende Zellreferenzen im Format A1, B2 etc. Bereiche im Format A1:B10.
Beispiele:
- "Summe von A1 bis A10" -> =SUM(A1:A10)
- "Wenn B1 > 100 dann Ja sonst Nein" -> =IF(B1>100,"Ja","Nein")
- "Durchschnitt der Spalte C" -> =AVERAGE(C1:C100)` },
            { role: "user", content: query }],
        ),
    );
    // Extract formula (starts with =)
    const match = result.match(/=.+/);
    return match ? match[0].trim() : result.trim();
}

export async function explainError(settings: AISettings, error: string, formula: string): Promise<string> {
    if (settings.provider === "local") {
        const res = await fetchWithTimeout(`${settings.baseUrl}/api/explain_error`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ error, formula }),
        });
        const json = await res.json();
        return json.explanation || "";
    }

    return completionToText(
        await chatCompletion(
            settings,
            [{ role: "system", content: "Du bist ein Tabellenkalkulations-Experte. Erkläre den Fehler kurz und präzise in 1-2 Sätzen und schlage eine Lösung vor." },
            { role: "user", content: `Die Formel "${formula}" hat den Fehler "${error}" zurückgegeben. Was ist das Problem und wie kann man es beheben?` }],
        ),
    );
}

export async function smartFill(settings: AISettings, items: string[]): Promise<string[]> {
    if (settings.provider === "local") {
        const res = await fetchWithTimeout(`${settings.baseUrl}/api/smart_fill`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items }),
        });
        const json = await res.json();
        return json.filled || [];
    }

    const result = completionToText(
        await chatCompletion(
            settings,
            [{ role: "system", content: "Du analysierst Datenreihen und erkennst Muster. Gib NUR die fehlenden Werte als JSON-Array zurück, z.B. [\"Wert1\", \"Wert2\"]. Keine Erklärung." },
            { role: "user", content: `Hier sind die ersten Werte einer Spalte (leere Strings sind Lücken): ${JSON.stringify(items)}. Erkenne das Muster und fülle die Lücken.` }],
        ),
    );

    try {
        const match = result.match(/\[.*\]/s);
        if (match) return JSON.parse(match[0]);
    } catch { /* ignore parse errors */ }
    return [];
}

export async function gridAction(settings: AISettings, context: string, instruction: string, gridData: string[][], computedData: string[][]): Promise<GridActionResult> {
    // If AI provider is `local`, use the legacy fallback format (local HTTP API).
    if (settings.provider === "local") {
        const res = await fetchWithTimeout(`${settings.baseUrl}/api/grid_action`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ context, instruction, gridData, computedData }),
        });
        if (!res.ok) throw new Error("Failed AI Grid Action");
        const result = await res.json();
        return { type: "raw_data", data: result.new_grid_data || null };
    }

    // For external providers (Groq, OpenAI etc.) we use explicit tool-calling
    // so the model returns structured tool calls instead of freeform text.
    const sampleData = gridData.slice(0, 20).map(row => row.slice(0, 10));

    const tools: ChatCompletionTools = [
        {
            type: "function",
            function: {
                name: "format_cells",
                description: "Hiermit formatierst du Tabellenzellen farblich oder im Textstil.",
                parameters: {
                    type: "object",
                    properties: {
                        range: {
                            type: "string",
                            description: "Der Bereich (z.B. 'A1:C5' oder 'A:A')."
                        },
                        style: {
                            type: "object",
                            properties: {
                                bold: { type: "boolean" },
                                italic: { type: "boolean" },
                                color: { type: "string", description: "CSS Farbwert für Text" },
                                bgColor: { type: "string", description: "CSS Farbwert für Hintergrund, z.B. '#ff0000'" },
                                align: { type: "string", enum: ["left", "center", "right"] }
                            }
                        }
                    },
                    required: ["range", "style"]
                }
            }
        },
        {
            type: "function",
            function: {
                name: "update_values",
                description: "Hiermit änderst du Inhalte oder schreibst Formeln in einen zusammenhängenden Block von Zellen. Formeln beginnen mit = und verwenden englische Funktionsnamen (SUM, AVERAGE, COUNT, MAX, MIN, IF, VLOOKUP, COUNTIF, SUMIF, INDEX, MATCH, ROUND, CONCATENATE, LEFT, RIGHT, MID, LEN, TRIM, ABS, SQRT, AND, OR, NOT, IFERROR).",
                parameters: {
                    type: "object",
                    properties: {
                        startCell: {
                            type: "string",
                            description: "Die Zelle oben links im Block (z.B. 'A1')."
                        },
                        values: {
                            type: "array",
                            description: "Ein 2D Array der Werte. Formeln beginnen mit '='. Bsp: [['Summe','=SUM(A1:A10)'],['Durchschnitt','=AVERAGE(B1:B10)']]",
                            items: {
                                type: "array",
                                items: { type: "string" }
                            }
                        }
                    },
                    required: ["startCell", "values"]
                }
            }
        },
        {
            type: "function",
            function: {
                name: "clear_range",
                description: "Leert den Inhalt eines spezifischen Bereichs.",
                parameters: {
                    type: "object",
                    properties: {
                        range: {
                            type: "string",
                            description: "Der Bereich (z.B. 'B2:C4')."
                        }
                    },
                    required: ["range"]
                }
            }
        }
    ];

    const sysPrompt = `Du bist ein hochentwickelter KI-Datenanalyst für eine Tabellenkalkulation (wie Excel). 
Die Tabelle hat Zeilen (1, 2, 3...) und Spalten (A, B, C...).
Deine Aufgabe: Analysiere den Wunsch des Nutzers und führe EINES oder MEHRERE Tools aus, um die Tabelle anzupassen.
WICHTIG: Bevorzuge Excel-Formeln (=SUM, =AVERAGE, =IF, =VLOOKUP, =COUNTIF, =SUMIF etc.) statt statischer Werte, wenn der Nutzer Berechnungen, Summen, Durchschnitte oder Analysen anfragt.
Rechne nicht im Klartext zurück! Gib KEINE Erklärungen. Ruf ZWINGEND eines der definierten Tools auf (oder mehrere hintereinander).`;

    const result = await chatCompletion(
        settings,
        [{ role: "system", content: sysPrompt },
        { role: "user", content: `Kontext: ${context}\nAnweisung: ${instruction}\nAktuelle Daten (Top 20x10):\n${JSON.stringify(sampleData)}` }],
        tools
    );

    if (Array.isArray(result) && result[0]?.function?.name) {
        // Tool calls were returned by the model — hand them back to the caller.
        return { type: "tools", calls: result };
    }

    // Failsafe for models that ignored tool-calling (or return raw text),
    // attempt to parse a JSON-like response as a fallback.
    try {
        if (typeof result === "string") {
            const match = result.match(/\[\s*\[.*\]\s*\]/s);
            if (match) return { type: "raw_data", data: JSON.parse(match[0]) };
        }
    } catch { /* ignore */ }
    return null;
}

export async function optimizeText(settings: AISettings, text: string): Promise<string> {
    if (settings.provider === "local") {
        const res = await fetchWithTimeout(`${settings.baseUrl}/api/optimize_text`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text }),
        });
        const json = await res.json();
        return json.optimized || "";
    }

    return completionToText(
        await chatCompletion(
            settings,
            [{ role: "system", content: "Du bist ein professioneller Lektor. Korrigiere Grammatik und Rechtschreibung des folgenden Textes. Behalte den Ton bei. Gib NUR den korrigierten Text zurück, ohne Erklärung." },
            { role: "user", content: text }]
        ),
    );
}

export async function completeText(settings: AISettings, text: string): Promise<string> {
    if (settings.provider === "local") {
        const res = await fetchWithTimeout(`${settings.baseUrl}/api/complete`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text, max_new_tokens: 5 }),
        });
        const json = await res.json();
        return json.completion || "";
    }

    const result = completionToText(
        await chatCompletion(
            settings,
            [{ role: "system", content: "Du vervollständigst Texte. Gib NUR die nächsten 3-8 Wörter zurück, die den Satz natürlich fortsetzen. Keine Erklärung, nur die Fortsetzung." },
            { role: "user", content: `Vervollständige diesen Text: "${text}"` }]
        ),
    );
    return result.trim();
}

// ── AI Document / Spreadsheet Generation ──────────────────────────────

export async function generateDocument(settings: AISettings, prompt: string): Promise<string> {
    return completionToText(
        await chatCompletion(
            settings,
            [{ role: "system", content: `Du bist ein professioneller Dokumenten-Ersteller. Erstelle ein vollständiges HTML-Dokument basierend auf der Anweisung des Benutzers.
Verwende semantisches HTML: <h1>, <h2>, <p>, <ul>, <li>, <table>, <strong>, <em> etc.
Gib NUR den HTML-Inhalt zurück, kein <html>, <head> oder <body> Tag. Nur den Dokumentinhalt.
Schreibe qualitativ hochwertigen, formatierten Inhalt.` },
            { role: "user", content: prompt }]
        ),
    );
}

export async function generateSpreadsheet(settings: AISettings, prompt: string, currentCols: number): Promise<string[][]> {
    const result = completionToText(
        await chatCompletion(
            settings,
            [{ role: "system", content: `Du bist ein Tabellenerstellungs-Experte. Basierend auf der Anweisung des Benutzers, erstelle Tabellendaten.
Gib das Ergebnis als JSON 2D-Array zurück. Die erste Zeile soll die Spaltenüberschriften enthalten.
Format: [["Header1","Header2"],["Wert1","Wert2"],...]
Gib NUR das Array zurück, keine Erklärung. Maximal ${currentCols} Spalten.` },
            { role: "user", content: prompt }]
        ),
    );

    try {
        const match = result.match(/\[\s*\[.*\]\s*\]/s);
        if (match) return JSON.parse(match[0]);
    } catch { /* ignore parse errors */ }
    return [];
}

// ── Image Source & Captioning ──────────────────────────────────────────

export async function generateImageSource(settings: AISettings, imageName: string, imageUrl?: string): Promise<string> {
    const prompt = `Du bist ein Recherche-Assistent. Der Nutzer hat folgendes Bild in sein Dokument hochgeladen:
Name der Datei: "${imageName}"
URL/Pfad (falls vorhanden): "${imageUrl || 'keine'}"

Bitte formuliere eine knappe, professionelle Bildunterschrift (Caption) und versuche - basierend auf dem Namen - eine plausible Quelle zu recherchieren oder anzugeben. 
WICHTIG: Erfinde keine Fakten, gib im Zweifel an, dass die Quelle unbekannt ist oder erstelle nur eine beschreibende Caption. Halte dich an maximal 2 Sätze.`;

    try {
        const response = completionToText(
            await chatCompletion(settings, [{ role: "system", content: "Du bist eine hilfreiche Recherche-KI für Bild-Captions." }, { role: "user", content: prompt }]),
        );
        return response.trim() || "Keine Quellenangabe verfügbar.";
    } catch (err: unknown) {
        console.error("Image Source Generation failed:", err);
        return "Fehler bei der automatischen Quellenrecherche.";
    }
}

// ── Connection Test ───────────────────────────────────────────────────

export async function testConnection(settings: AISettings): Promise<{ success: boolean; message: string }> {
    try {
        if (settings.provider === "local") {
            const res = await fetch(`${settings.baseUrl}/api/complete`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: "Hello", max_new_tokens: 1 }),
            });
            if (res.ok) return { success: true, message: "Verbindung zum lokalen Service erfolgreich!" };
            return { success: false, message: `Fehler: HTTP ${res.status}` };
        }

        if (settings.provider === "ollama") {
            const res = await fetch(`${settings.baseUrl}/api/tags`);
            if (res.ok) {
                const json = await res.json();
                const modelNames = json.models?.map((m: { name?: string }) => m.name).filter(Boolean) || [];
                return { success: true, message: `Verbunden! Verfügbare Modelle: ${modelNames.join(", ") || "keine"}` };
            }
            return { success: false, message: `Fehler: HTTP ${res.status}` };
        }

        // OpenAI-compatible: test with models endpoint
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (settings.apiKey) headers["Authorization"] = `Bearer ${settings.apiKey}`;

        const res = await fetch(`${settings.baseUrl}/models`, { headers });
        if (res.ok) return { success: true, message: "Verbindung erfolgreich! API-Key ist gültig." };
        if (res.status === 401) return { success: false, message: "Ungültiger API-Key!" };
        return { success: false, message: `Fehler: HTTP ${res.status}` };
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return { success: false, message: `Verbindung fehlgeschlagen: ${message}` };
    }
}

// ── SEPShow: Presentation AI Methods ──────────────────────────────────

export interface SlideOutlineItem {
    title: string;
    bullets: string[];
    layout: string;
}

export async function generateSlideOutline(settings: AISettings, topic: string): Promise<SlideOutlineItem[]> {
    const result = completionToText(
        await chatCompletion(
            settings,
            [{ role: "system", content: `Du bist ein Präsentations-Experte. Erstelle eine strukturierte Gliederung für eine Präsentation.
Gib das Ergebnis als JSON-Array zurück. Jedes Element hat:
- "title": Folientitel
- "bullets": Array mit 2-4 Stichpunkten
- "layout": eines von "title", "title-content", "two-columns", "image-left", "image-right", "blank"
Die erste Folie sollte layout "title" sein.
Gib NUR das JSON-Array zurück, keine Erklärung. 5-10 Folien.` },
            { role: "user", content: `Erstelle eine Präsentation zum Thema: "${topic}"` }],
        ),
    );

    try {
        const match = result.match(/\[[\s\S]*\]/);
        if (match) return JSON.parse(match[0]);
    } catch { /* ignore */ }
    return [];
}

export async function magicLayout(settings: AISettings, elements: { id: string; type: string; width: number; height: number }[]): Promise<{ id: string; x: number; y: number; width: number; height: number }[]> {
    const result = completionToText(
        await chatCompletion(
            settings,
            [{ role: "system", content: `Du bist ein Grafik-Designer. Arrangiere die gegebenen Elemente ästhetisch auf einer 960x540 Pixel Folie.
Beachte: Goldenen Schnitt, gleichmäßige Abstände, visuelles Gleichgewicht. Mindestens 40px Rand.
Gib ein JSON-Array zurück mit: [{"id": "...", "x": ..., "y": ..., "width": ..., "height": ...}]
NUR das Array, keine Erklärung.` },
            { role: "user", content: `Elemente: ${JSON.stringify(elements)}` }],
        ),
    );

    try {
        const match = result.match(/\[[\s\S]*\]/);
        if (match) return JSON.parse(match[0]);
    } catch { /* ignore */ }
    return [];
}

export async function vibeCheckSlides(settings: AISettings, texts: string[], tone: string): Promise<string[]> {
    const result = completionToText(
        await chatCompletion(
            settings,
            [{ role: "system", content: `Du bist ein Präsentations-Coach. Ändere den Tonfall der folgenden Texte gemäß der Anweisung.
Behalte die Struktur (Stichpunkte, Überschriften) bei, ändere nur den Ausdruck.
Gib ein JSON-Array mit den überarbeiteten Texten zurück. Gleiche Reihenfolge wie der Input.
NUR das Array, keine Erklärung.` },
            { role: "user", content: `Tonfall-Anweisung: "${tone}"\nTexte: ${JSON.stringify(texts)}` }],
        ),
    );

    try {
        const match = result.match(/\[[\s\S]*\]/);
        if (match) return JSON.parse(match[0]);
    } catch { /* ignore */ }
    return [];
}

export async function generateSpeakerNotes(settings: AISettings, slideTitle: string, bullets: string): Promise<string> {
    return completionToText(
        await chatCompletion(
            settings,
            [{ role: "system", content: `Du bist ein Rhetorik-Trainer. Basierend auf der Folie schreibe ausformulierte Sprechernotizen.
Diese sollen dem Redner als Leitfaden dienen. 3-5 Sätze pro Folie. Natürlich und professionell.
Gib NUR die Notizen zurück, keine Erklärung.` },
            { role: "user", content: `Folientitel: "${slideTitle}"\nStichpunkte: ${bullets}` }]
        ),
    );
}
