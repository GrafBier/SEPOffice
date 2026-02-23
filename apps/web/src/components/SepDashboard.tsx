import React, { useState, useEffect, useCallback } from 'react';
/**
 * SepDashboard
 * - Entry surface for the three main apps (SEPWrite, SEPGrid, SEPShow).
 * - Uses `persistenceService.getRecentDocs()` to render a small MRU list. This
 *   call is wrapped in `useMemo` to avoid repeated parsing of localStorage on
 *   every render; if the app grows events should invalidate a lightweight
 *   cache instead of re-parsing in render paths.
 * - Visuals are intentionally kept client-only (no server roundtrip) to make
 *   this dashboard instant; be careful when adding heavy computations here.
 */
import { persistenceService } from '../services/persistenceService';
import { useTranslation } from "react-i18next";
import type { DocMetadata } from '../services/persistenceService';
import {
    FileText,
    Grid3X3,
    Presentation,
    Clock,
    ArrowRight
} from 'lucide-react';

interface SepDashboardProps {
    onSelectApp: (app: 'write' | 'grid' | 'show', docId?: string) => void;
}

export const SepDashboard: React.FC<SepDashboardProps> = ({ onSelectApp }) => {
    const { t } = useTranslation();
    const [recentDocs, setRecentDocs] = useState<DocMetadata[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadDocs = useCallback(async () => {
        setIsLoading(true);
        const docs = await persistenceService.getRecentDocs();
        setRecentDocs(docs);
        setIsLoading(false);
    }, []);

    useEffect(() => {
        loadDocs();
    }, [loadDocs]);

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (confirm("Möchten Sie dieses Dokument wirklich unwiderruflich löschen?")) {
            await persistenceService.deleteDoc(id);
            loadDocs();
        }
    };

    type AppCard = {
        id: 'write' | 'grid' | 'show';
        name: string;
        description: string;
        icon: React.ReactNode;
        color: string;
        status: string;
    };

    const apps: AppCard[] = [
        {
            id: 'write',
            name: 'SEPWrite',
            description: t('write_desc'),
            icon: <FileText size={32} color="#38bdf8" />,
            color: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
            status: t('active')
        },
        {
            id: 'grid',
            name: 'SEPGrid',
            description: t('grid_desc'),
            icon: <Grid3X3 size={32} color="#10b981" />,
            color: 'linear-gradient(135deg, #10b981, #059669)',
            status: t('active')
        },
        {
            id: 'show',
            name: 'SEPShow',
            description: t('show_desc'),
            icon: <Presentation size={32} color="#f59e0b" />,
            color: 'linear-gradient(135deg, #f59e0b, #d97706)',
            status: t('new_badge')
        }
    ];

    return (
        <div className="dashboard-container fade-in" style={{
            padding: '3rem',
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '3rem'
        }}>
            <div className="dashboard-welcome">
                <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', background: 'linear-gradient(to right, #e2e8f0, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {t('welcome')}
                </h2>
                <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>
                    {t('choose_app')}
                </p>
            </div>

            <div className="app-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                gap: '2rem'
            }}>
                {apps.map((app) => (
                    <div
                        key={app.id}
                        className="app-card"
                        onClick={() => onSelectApp(app.id)}
                        style={{
                            background: 'rgba(30, 41, 59, 0.4)',
                            backdropFilter: 'blur(12px)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '16px',
                            padding: '2rem',
                            cursor: 'pointer',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            padding: '0.75rem 1.25rem',
                            background: app.id === 'show' ? '#f59e0b' : 'rgba(255,255,255,0.05)',
                            color: app.id === 'show' ? '#0f172a' : '#94a3b8',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            borderBottomLeftRadius: '12px'
                        }}>
                            {app.status}
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            {app.icon}
                        </div>

                        <h3 style={{ fontSize: '1.5rem', marginBottom: '0.75rem', color: '#f8fafc' }}>
                            {app.name}
                        </h3>

                        <p style={{ color: '#94a3b8', marginBottom: '2rem', lineHeight: 1.6 }}>
                            {app.description}
                        </p>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#38bdf8', fontWeight: 600 }}>
                            Jetzt starten <ArrowRight size={16} />
                        </div>

                        {/* Subtle hover indicator */}
                        <div className="hover-glow" style={{
                            position: 'absolute',
                            bottom: '-20%',
                            right: '-20%',
                            width: '150px',
                            height: '150px',
                            background: app.color,
                            filter: 'blur(60px)',
                            opacity: 0,
                            transition: 'opacity 0.3s'
                        }} />
                    </div>
                ))}
            </div>

            <div className="recent-section" style={{ marginTop: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <Clock size={20} color="#94a3b8" />
                    <h3 style={{ color: '#e2e8f0', fontSize: '1.25rem' }}>{t('recent_docs')}</h3>
                </div>

                {isLoading ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>Lade Dokumente...</div>
                ) : recentDocs.length === 0 ? (
                    <div style={{
                        background: 'rgba(15, 23, 42, 0.3)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        borderRadius: '12px',
                        padding: '2rem',
                        textAlign: 'center',
                        color: '#64748b'
                    }}>
                        Keine letzten Dokumente gefunden. Erstellen Sie ein neues Dokument, um hier Einträge zu sehen.
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                        {recentDocs.map(doc => (
                            <div
                                key={doc.id}
                                onClick={() => onSelectApp(doc.type, doc.id)}
                                style={{
                                    background: 'rgba(30, 41, 59, 0.4)',
                                    border: '1px solid rgba(255, 255, 255, 0.05)',
                                    borderRadius: '12px',
                                    padding: '1rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    transition: 'all 0.2s',
                                    position: 'relative'
                                }}
                                className="recent-item"
                            >
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: doc.type === 'write' ? '#0ea5e922' : doc.type === 'grid' ? '#10b98122' : '#f59e0b22'
                                }}>
                                    {doc.type === 'write' ? <FileText size={20} color="#38bdf8" /> :
                                        doc.type === 'grid' ? <Grid3X3 size={20} color="#10b981" /> :
                                            <Presentation size={20} color="#f59e0b" />}
                                </div>
                                <div style={{ flex: 1, overflow: 'hidden' }}>
                                    <div style={{ color: '#f8fafc', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {doc.name}
                                    </div>
                                    <div style={{ color: '#64748b', fontSize: '0.75rem' }}>
                                        {new Date(doc.updatedAt).toLocaleDateString()} {new Date(doc.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => handleDelete(e, doc.id)}
                                    title="Löschen"
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: '#ef4444',
                                        padding: '0.5rem',
                                        cursor: 'pointer',
                                        borderRadius: '6px',
                                        opacity: 0.5,
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                                    onMouseLeave={e => (e.currentTarget.style.opacity = '0.5')}
                                >
                                    🗑️
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        .app-card:hover {
          transform: translateY(-8px);
          border-color: rgba(56, 189, 248, 0.4);
          background: rgba(30, 41, 59, 0.6);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
        }
        .app-card:hover .hover-glow {
          opacity: 0.2;
        }
        .recent-item:hover {
          background: rgba(30, 41, 59, 0.8) !important;
          border-color: rgba(56, 189, 248, 0.3) !important;
          transform: translateX(4px);
        }
      `}} />
        </div>
    );
};
