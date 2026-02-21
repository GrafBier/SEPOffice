import { createContext, useContext, useState, useEffect } from "react";
import type { AISettings } from "../services/aiService";
import { DEFAULT_SETTINGS } from "../services/aiService";

interface AISettingsContextType {
    settings: AISettings;
    updateSettings: (updates: Partial<AISettings>) => void;
    resetSettings: () => void;
}

const AISettingsContext = createContext<AISettingsContextType>({
    settings: DEFAULT_SETTINGS,
    updateSettings: () => { },
    resetSettings: () => { },
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

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }, [settings]);

    const updateSettings = (updates: Partial<AISettings>) => {
        setSettings((prev) => ({ ...prev, ...updates }));
    };

    const resetSettings = () => {
        setSettings(DEFAULT_SETTINGS);
        localStorage.removeItem(STORAGE_KEY);
    };

    return (
        <AISettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
            {children}
        </AISettingsContext.Provider>
    );
}

export function useAISettings() {
    return useContext(AISettingsContext);
}
