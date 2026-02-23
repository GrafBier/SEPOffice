import { useEffect, useState } from 'react';
import SepEditor from './components/SepEditor';
import SepGrid from './components/SepGrid';
import SepShow from './components/SepShow';
import { SepDashboard } from './components/SepDashboard';
import SettingsModal from './components/SettingsModal';
import { AISettingsProvider } from './contexts/AISettingsContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Settings, Keyboard, X, Sun, Moon, Sparkles, Bot, Terminal, ShieldAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';


function HelpModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  if (!isOpen) return null;
  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "600px" }}>
        <div className="settings-header">
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Keyboard size={20} color="#38bdf8" />
            <h2 style={{ background: "linear-gradient(to right, #38bdf8, #818cf8)", backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{t('help')}</h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><X size={20} /></button>
        </div>
        <div className="settings-content" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1rem', color: '#f8fafc', marginBottom: '10px' }}>Global</h3>
              <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.9rem', color: '#94a3b8' }}>
                <li style={{ marginBottom: '6px' }}><kbd>F1</kbd> - {t('help')}</li>
                <li style={{ marginBottom: '6px' }}><kbd>Alt + 1-4</kbd> - App wechseln</li>
                <li style={{ marginBottom: '6px' }}><kbd>Ctrl + P</kbd> - {t('print')} / PDF</li>
              </ul>
              <h3 style={{ fontSize: '1rem', color: '#f8fafc', margin: '15px 0 10px 0' }}>Allgemeines Editieren</h3>
              <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.9rem', color: '#94a3b8' }}>
                <li style={{ marginBottom: '6px' }}><kbd>Ctrl + Z</kbd> - {t('undo')}</li>
                <li style={{ marginBottom: '6px' }}><kbd>Ctrl + Y</kbd> - {t('redo')}</li>
                <li style={{ marginBottom: '6px' }}><kbd>Ctrl + B/I/U</kbd> - Fett/Kursiv/Unterstrichen</li>
              </ul>
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', color: '#f8fafc', marginBottom: '10px' }}>SEPGrid</h3>
              <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.9rem', color: '#94a3b8' }}>
                <li style={{ marginBottom: '6px' }}><kbd>Pfeiltasten</kbd> - Navigation</li>
                <li style={{ marginBottom: '6px' }}><kbd>F2 / Enter</kbd> - Zelle bearbeiten</li>
                <li style={{ marginBottom: '6px' }}><kbd>Ctrl + C/V</kbd> - Kopieren / Einfügen</li>
              </ul>
              <h3 style={{ fontSize: '1rem', color: '#f8fafc', margin: '15px 0 10px 0' }}>SEPShow</h3>
              <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.9rem', color: '#94a3b8' }}>
                <li style={{ marginBottom: '6px' }}><kbd>Entfernen</kbd> - Element löschen</li>
                <li style={{ marginBottom: '6px' }}><kbd>Strg + Paste</kbd> - Text/Bild einfügen</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="settings-footer">
          <button className="settings-save-btn" onClick={onClose}>Verstanden</button>
        </div>
      </div>
    </div>
  );
}


function App() {
  const { t } = useTranslation();
  const [activeApp, setActiveApp] = useState<'dashboard' | 'write' | 'grid' | 'show'>('dashboard');
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('sep-theme') as 'dark' | 'light') || 'dark';
  });
  const [envInfo, setEnvInfo] = useState<any>(null);
  const [aiStatus, setAiStatus] = useState<'offline' | 'loading' | 'online'>('offline');
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  const handleStartAi = async () => {
    // @ts-ignore
    if (window.electronAPI?.startAi) {
      setAiStatus('loading');
      // @ts-ignore
      await window.electronAPI.startAi();
      console.log("AI Backend startup requested via IPC.");
    } else {
      console.warn("electronAPI.startAi not available (Dev Browser?)");
    }
  };

  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
    localStorage.setItem('sep-theme', theme);
  }, [theme]);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F1') {
        e.preventDefault();
        setHelpOpen(prev => !prev);
      }
      if (e.altKey) {
        if (e.key === '1') setActiveApp('dashboard');
        if (e.key === '2') setActiveApp('write');
        if (e.key === '3') setActiveApp('grid');
        if (e.key === '4') setActiveApp('show');
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Diagnostic Init & Focus Recovery
  useEffect(() => {
    const fetchEnv = async () => {
      // @ts-ignore
      if (window.electronAPI?.getEnv) {
        // @ts-ignore
        const env = await window.electronAPI.getEnv();
        setEnvInfo(env);
      }
    };
    fetchEnv();

    const checkAi = async () => {
      try {
        const res = await fetch('http://localhost:8080/health');
        if (res.ok) {
          const data = await res.json();
          setAiStatus(data.status === 'ok' ? 'online' : 'loading');
        } else {
          setAiStatus('offline');
        }
      } catch {
        setAiStatus('offline');
      }
    };
    checkAi();
    const interval = setInterval(checkAi, 5000);

    // EMERGENCY FOCUS RECOVERY
    const recoverFocus = () => {
      if (!document.activeElement || document.activeElement === document.body) {
        console.log("RECOVERY: Forcing focus to main container");
        const main = document.querySelector('main');
        if (main) (main as HTMLElement).focus();
      }
    };
    window.addEventListener('mousedown', recoverFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('mousedown', recoverFocus);
    };
  }, []);

  return (
    <AISettingsProvider>
      <header className="app-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <h1 className="app-title">SEPOffice</h1>
          <nav className="app-nav">
            <button
              className={`nav-btn ${activeApp === 'dashboard' ? 'active' : ''}`}
              onClick={() => {
                setActiveApp('dashboard');
                setActiveDocId(null);
              }}
            >
              {t('dashboard')}
            </button>
            <button
              className={`nav-btn ${activeApp === 'write' ? 'active' : ''}`}
              onClick={() => setActiveApp('write')}
            >
              {t('write')}
            </button>
            <button
              className={`nav-btn ${activeApp === 'grid' ? 'active' : ''}`}
              onClick={() => setActiveApp('grid')}
            >
              {t('grid')}
            </button>
            <button
              className={`nav-btn ${activeApp === 'show' ? 'active' : ''}`}
              onClick={() => setActiveApp('show')}
            >
              {t('show')}
            </button>
          </nav>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className="nav-btn settings-trigger"
            onClick={handleStartAi}
            title="AI Backend manuell starten"
            style={{ color: '#fbbf24' }}
          >
            <Sparkles size={18} />
          </button>
          <button
            className="nav-btn settings-trigger"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title={theme === 'dark' ? t('theme_light') : t('theme_dark')}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            className="nav-btn settings-trigger"
            onClick={() => setHelpOpen(true)}
            title={`${t('help')} (F1)`}
          >
            <Keyboard size={18} />
          </button>
          <button
            className="nav-btn settings-trigger"
            onClick={() => setSettingsOpen(true)}
            title={t('settings')}
          >
            <Settings size={18} />
          </button>
        </div>
      </header>
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {activeApp === 'dashboard' && (
          <ErrorBoundary appName="Dashboard">
            <SepDashboard onSelectApp={(app: 'write' | 'grid' | 'show', docId?: string) => {
              setActiveApp(app);
              setActiveDocId(docId ?? null);
            }} />
          </ErrorBoundary>
        )}
        {activeApp === 'write' && (
          <ErrorBoundary appName="SEPWrite">
            <SepEditor docId={activeDocId} />
          </ErrorBoundary>
        )}
        {activeApp === 'grid' && (
          <ErrorBoundary appName="SEPGrid">
            <SepGrid docId={activeDocId} />
          </ErrorBoundary>
        )}
        {activeApp === 'show' && (
          <ErrorBoundary appName="SEPShow">
            <SepShow docId={activeDocId} />
          </ErrorBoundary>
        )}
      </main>
      <footer className="app-status-bar">
        <div className="status-item">
          <span className={`status-dot ${aiStatus}`}></span>
          <span>AI: {aiStatus.toUpperCase()}</span>
          <button
            onClick={() => setShowDiagnostics(!showDiagnostics)}
            style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', marginLeft: '8px', display: 'flex' }}
            title="System-Diagnose"
          >
            <Terminal size={12} />
          </button>
        </div>
        <div>
          <strong>SEP Interactive</strong> &copy; 2026
        </div>
        <div className="status-item">
          <span className="diagnostic-tag">API: 4000</span>
          <span className="diagnostic-tag">Port: 8080</span>
        </div>
      </footer>

      {showDiagnostics && (
        <div className="settings-overlay" style={{ zIndex: 3000 }} onClick={() => setShowDiagnostics(false)}>
          <div className="settings-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '450px' }}>
            <div className="settings-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Bot size={18} color="#38bdf8" />
                <h2 style={{ background: 'linear-gradient(to right, #38bdf8, #818cf8)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>System-Diagnose</h2>
              </div>
              <button onClick={() => setShowDiagnostics(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div className="settings-content" style={{ fontSize: '0.85rem' }}>
              <div style={{ display: 'grid', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>Build Modus:</span>
                  <span style={{ color: '#f8fafc' }}>{envInfo?.isDev ? 'Development' : 'Production (Frozen)'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>API Bridge:</span>
                  <span style={{ color: '#f8fafc' }}>{window.electronAPI ? 'Gefunden' : 'Nicht gefunden'}</span>
                </div>
                <div style={{ padding: '8px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px' }}>
                  <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '4px' }}>AI Pfad Check:</div>
                  <code style={{ fontSize: '0.7rem', color: '#38bdf8', wordBreak: 'break-all' }}>{envInfo?.aiPath || 'Lade...'}</code>
                </div>
                <div style={{ display: 'flex', gap: '8px', color: '#fbbf24', fontSize: '0.8rem', marginTop: '8px' }}>
                  <ShieldAlert size={14} />
                  <span>Falls Tastatureingaben hängen, bitte einmal ins leere Feld klicken.</span>
                </div>
              </div>
            </div>
            <div className="settings-footer">
              <button className="settings-save-btn" onClick={() => setShowDiagnostics(false)}>Schließen</button>
            </div>
          </div>
        </div>
      )}

      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <HelpModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
    </AISettingsProvider>
  );
}

export default App;
