import { useState } from "react";
/**
 * SettingsModal notes:
 * - Centralized UI for AI provider configuration and connection testing.
 * - `PROVIDER_DEFAULTS` drives sensible defaults per-provider; changing the
 *   defaults affects the UI immediately via `handleProviderChange` which writes
 *   the baseUrl/model fields. Keep defaults in sync with server/provider
 *   adapters.
 * - `testConnection` is intentionally exposed to give users immediate feedback
 *   about credentials and connectivity. It should be cheap and not send large
 *   payloads to remote providers.
 */
import { useAISettings } from "../contexts/AISettingsContext";
import type { AIProvider } from "../services/aiService";
import { PROVIDER_DEFAULTS, testConnection } from "../services/aiService";
import { Settings, X, Check, AlertCircle, Loader2, Globe } from "lucide-react";
import { useTranslation } from "react-i18next";

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const { t, i18n } = useTranslation();
    const { settings, updateSettings, resetSettings } = useAISettings();
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
    const [isTesting, setIsTesting] = useState(false);

    if (!isOpen) return null;

    const languages = [
        { code: 'de', name: 'Deutsch' },
        { code: 'en', name: 'English' },
        { code: 'zh', name: '中文' },
        { code: 'fr', name: 'Français' },
        { code: 'es', name: 'Español' },
        { code: 'it', name: 'Italiano' },
        { code: 'ru', name: 'Русский' },
        { code: 'ja', name: '日本語' },
        { code: 'ko', name: '한국어' },
        { code: 'vi', name: 'Tiếng Việt' },
        { code: 'th', name: 'ไทย' },
        { code: 'id', name: 'Bahasa Indonesia' },
        { code: 'pt', name: 'Português' },
        { code: 'ar', name: 'العربية' },
        { code: 'tr', name: 'Türkçe' },
        { code: 'el', name: 'Ελληνικά' },
        { code: 'nl', name: 'Nederlands' },
        { code: 'hi', name: 'हिन्दी' },
        { code: 'bn', name: 'বাংলা' },
        { code: 'ms', name: 'Bahasa Melayu' },
        { code: 'fa', name: 'فارسی' },
        { code: 'he', name: 'עברית' },
        { code: 'pl', name: 'Polski' },
        { code: 'cs', name: 'Čeština' },
        { code: 'sv', name: 'Svenska' },
        { code: 'no', name: 'Norsk' },
        { code: 'da', name: 'Dansk' },
        { code: 'fi', name: 'Suomi' },
        { code: 'uk', name: 'Українська' },
    ];

    const providerConfig = PROVIDER_DEFAULTS[settings.provider];

    const handleProviderChange = (provider: AIProvider) => {
        const defaults = PROVIDER_DEFAULTS[provider];
        updateSettings({
            provider,
            baseUrl: defaults.baseUrl,
            model: defaults.models[0],
        });
        setTestResult(null);
    };

    const handleTest = async () => {
        setIsTesting(true);
        setTestResult(null);
        try {
            const result = await testConnection(settings);
            setTestResult(result);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            setTestResult({ success: false, message });
        } finally {
            setIsTesting(false);
        }
    };

    return (
        <div className="settings-overlay" onClick={onClose}>
            <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="settings-header">
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <Settings size={20} className="settings-icon" />
                        <h2>{t('settings')}</h2>
                    </div>
                    <button className="settings-close-btn" onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>

                {/* Content */}
                <div className="settings-content">
                    {/* Section: Language */}
                    <div className="settings-section">
                        <h3><Globe size={18} style={{ verticalAlign: 'middle', marginRight: '8px' }} /> Sprache / Language</h3>
                        <div className="settings-field">
                            <select
                                value={i18n.language}
                                onChange={(e) => i18n.changeLanguage(e.target.value)}
                                className="settings-select"
                                style={{ width: '100%' }}
                            >
                                {languages.map((lang) => (
                                    <option key={lang.code} value={lang.code}>{lang.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Section: KI-Provider */}
                    <div className="settings-section">
                        <h3>🤖 KI-Provider</h3>
                        <p className="settings-description">
                            Wähle den KI-Anbieter, der für alle intelligenten Funktionen verwendet wird.
                        </p>

                        <div className="provider-grid">
                            {(Object.keys(PROVIDER_DEFAULTS) as AIProvider[]).map((key) => (
                                <button
                                    key={key}
                                    className={`provider-card ${settings.provider === key ? "active" : ""}`}
                                    onClick={() => handleProviderChange(key)}
                                >
                                    <span className="provider-emoji">
                                        {key === "local" ? "🐍" : key === "groq" ? "⚡" : key === "openai" ? "🧠" : key === "ollama" ? "🦙" : key === "lmstudio" ? "💻" : "🤖"}
                                    </span>
                                    <span className="provider-name">{PROVIDER_DEFAULTS[key].label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Section: Konfiguration */}
                    <div className="settings-section">
                        <h3>⚙️ Konfiguration</h3>

                        {/* API Key (only for cloud providers) */}
                        {providerConfig.needsApiKey && (
                            <div className="settings-field">
                                <label>API-Key</label>
                                <input
                                    type="password"
                                    value={settings.apiKey}
                                    onChange={(e) => updateSettings({ apiKey: e.target.value })}
                                    placeholder={`${PROVIDER_DEFAULTS[settings.provider].label} API-Key eingeben...`}
                                    className="settings-input"
                                />
                            </div>
                        )}

                        {/* Base URL */}
                        <div className="settings-field">
                            <label>Base URL</label>
                            <input
                                type="text"
                                value={settings.baseUrl}
                                onChange={(e) => updateSettings({ baseUrl: e.target.value })}
                                placeholder="http://localhost:..."
                                className="settings-input"
                            />
                        </div>

                        {/* Model Selection */}
                        <div className="settings-field">
                            <label>Modell</label>
                            <div style={{ display: "flex", gap: "0.5rem" }}>
                                <select
                                    value={settings.model}
                                    onChange={(e) => updateSettings({ model: e.target.value })}
                                    className="settings-select"
                                >
                                    {providerConfig.models.map((m) => (
                                        <option key={m} value={m}>{m}</option>
                                    ))}
                                </select>
                                <input
                                    type="text"
                                    value={settings.model}
                                    onChange={(e) => updateSettings({ model: e.target.value })}
                                    placeholder="Oder manuell eingeben..."
                                    className="settings-input"
                                    style={{ flex: 1 }}
                                />
                            </div>
                        </div>

                        {/* Temperature */}
                        <div className="settings-field">
                            <label>Temperature: {settings.temperature.toFixed(1)}</label>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={settings.temperature}
                                onChange={(e) => updateSettings({ temperature: parseFloat(e.target.value) })}
                                className="settings-range"
                            />
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#64748b" }}>
                                <span>Präzise</span>
                                <span>Kreativ</span>
                            </div>
                        </div>
                    </div>

                    {/* Connection Test */}
                    <div className="settings-section">
                        <h3>🔌 Verbindung</h3>
                        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                            <button
                                className="settings-test-btn"
                                onClick={handleTest}
                                disabled={isTesting}
                            >
                                {isTesting ? (
                                    <><Loader2 size={14} className="spin" /> Teste...</>
                                ) : (
                                    <>Verbindung testen</>
                                )}
                            </button>
                            {testResult && (
                                <div className={`test-result ${testResult.success ? "success" : "error"}`}>
                                    {testResult.success ? <Check size={14} /> : <AlertCircle size={14} />}
                                    <span>{testResult.message}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="settings-footer">
                    <button className="settings-reset-btn" onClick={resetSettings}>
                        Zurücksetzen
                    </button>
                    <button className="settings-save-btn" onClick={onClose}>
                        <Check size={14} /> Fertig
                    </button>
                </div>
            </div>
        </div>
    );
}
