import React, { createContext, useContext, useState, useEffect } from "react";
import type { AISettings } from "../services/aiService";
import { DEFAULT_SETTINGS } from "../services/aiService";

export type AIStatus = "ok" | "loading" | "error" | "uninitialized";

interface AISettingsContextType {
    settings: AISettings;
    status: AIStatus;
    progress: number;
    lastError: string | null;
    updateSettings: (updates: Partial<AISettings>) => void;
    resetSettings: () => void;
    startAI: () => void;
}

const AISettingsContext = createContext<AISettingsContextType>({
    settings: DEFAULT_SETTINGS,
    status: "uninitialized",
    progress: 0,
    lastError: null,
    updateSettings: () => { },
    resetSettings: () => { },
    startAI: () => { },
});

const STORAGE_KEY = "sepoffice-ai-settings";

export function AISettingsProvider({ children }: { children: React.ReactNode }) {
    const [settings, setSettings] = useState<AISettings>(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                return { ...DEFAULT_SETTINGS, ...parsed };
            }
        } catch { /* ignore */ }
        return DEFAULT_SETTINGS;
    });

    const [status, setStatus] = useState<AIStatus>("loading");
    const [progress, setProgress] = useState(0);
    const [lastError, setLastError] = useState<string | null>(null);
    // Track when loading started so we can timeout after 5 minutes
    const loadingStartedAt = React.useRef<number>(Date.now());
    // Ref to always access current status inside interval callbacks (avoids stale closure)
    const statusRef = React.useRef<AIStatus>("loading");
    const setStatusWithRef = (s: AIStatus) => { statusRef.current = s; setStatus(s); };

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }, [settings]);

    const checkHealth = async () => {
        if (settings.provider !== "local") {
            if (statusRef.current !== "ok") setStatusWithRef("ok");
            return;
        }

        try {
            const res = await fetch("http://localhost:8080/health");
            if (!res.ok) throw new Error("Health check failed");
            const data = await res.json();
            
            // Map backend status to frontend status
            if (data.status === "loading") {
                setStatusWithRef("loading");
            } else if (data.status === "ok") {
                setStatusWithRef("ok");
            } else {
                setStatusWithRef("error");
            }

            if (data.progress !== undefined) setProgress(data.progress);
            if (data.last_error) setLastError(data.last_error);
        } catch (e) {
            // If we are in loading state, stay loading until 5 minute timeout
            if (statusRef.current === "loading") {
                const elapsed = Date.now() - loadingStartedAt.current;
                if (elapsed < 5 * 60 * 1000) {
                    return; // Stay in loading state, keep polling
                }
            }
            // Timeout reached or not loading - show error/start button
            setStatusWithRef("uninitialized");
            setLastError("Could not connect to AI Service.");
        }
    };

    useEffect(() => {
        // Initial check
        checkHealth();

        // Poll every second while loading, every 5 seconds otherwise
        const interval = setInterval(checkHealth, statusRef.current === "loading" ? 1000 : 5000);
        return () => clearInterval(interval);
    }, [status, settings.provider]);

    const updateSettings = (updates: Partial<AISettings>) => {
        setSettings((prev) => ({ ...prev, ...updates }));
    };

    const resetSettings = () => {
        setSettings(DEFAULT_SETTINGS);
        localStorage.removeItem(STORAGE_KEY);
    };

    const startAI = async () => {
        if (window.electronAPI) {
             setStatusWithRef("loading");
             setProgress(0);
             loadingStartedAt.current = Date.now(); // Reset timer on manual start
             try {
                await window.electronAPI.startAi();
                // Poll after a delay to give the process time to boot
                setTimeout(checkHealth, 2000);
             } catch (e) {
                 console.error("Failed to start AI via Electron:", e);
                 setLastError("Failed to start AI process.");
                 setStatusWithRef("error");
             }
        } else {
            console.error("Electron API not available");
            setLastError("Electron context missing.");
        }
    };

    return (
        <AISettingsContext.Provider value={{ settings, status, progress, lastError, updateSettings, resetSettings, startAI }}>
            {children}
        </AISettingsContext.Provider>
    );
}

export function useAISettings() {
    return useContext(AISettingsContext);
}
