/**
 * persistenceService notes:
 * - Documents and their metadata are stored in localStorage under two keys:
 *   - `sepoffice_recent_docs`: JSON array of `DocMetadata` (MRU list, max 10)
 *   - `sepoffice_doc_<id>`: raw document content string
 * - Storage calculations use a UTF-16 assumption (2 bytes per character) which
 *   approximates browser storage usage; this is conservative but useful for
 *   warning the user about localStorage limits.
 * - Quota/QuotaExceeded handling: different browsers throw different errors;
 *   we check common payload shapes and return a friendly warning instead of
 *   letting exceptions bubble to the UI.
 */
export interface DocMetadata {
    id: string;
    name: string;
    type: 'write' | 'grid' | 'show';
    updatedAt: number;
}

export interface SaveResult {
    success: boolean;
    warning?: string;
}

export const persistenceService = {
    getRecentDocs(): DocMetadata[] {
        const data = localStorage.getItem('sepoffice_recent_docs');
        return data ? JSON.parse(data) : [];
    },

    getStorageUsage(): { usedBytes: number; usedMB: string; warningLevel: 'ok' | 'warn' | 'critical' } {
        let total = 0;
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key) {
                total += (localStorage.getItem(key) || '').length * 2; // UTF-16
            }
        }
        const mb = (total / (1024 * 1024)).toFixed(2);
        const level = total > 4.5 * 1024 * 1024 ? 'critical' : total > 3.5 * 1024 * 1024 ? 'warn' : 'ok';
        return { usedBytes: total, usedMB: mb, warningLevel: level };
    },

    saveDoc(id: string, name: string, type: 'write' | 'grid' | 'show', content: string): SaveResult {
        try {
            const docs = this.getRecentDocs();
            const existingIndex = docs.findIndex(d => d.id === id);

            const meta: DocMetadata = {
                id,
                name,
                type,
                updatedAt: Date.now()
            };

            if (existingIndex > -1) {
                docs.splice(existingIndex, 1);
            }
            docs.unshift(meta);

            localStorage.setItem('sepoffice_recent_docs', JSON.stringify(docs.slice(0, 10)));
            localStorage.setItem(`sepoffice_doc_${id}`, content);

            const usage = this.getStorageUsage();
            if (usage.warningLevel === 'critical') {
                return { success: true, warning: `Speicher fast voll! ${usage.usedMB} MB belegt. Bitte alte Dokumente löschen.` };
            }
            if (usage.warningLevel === 'warn') {
                return { success: true, warning: `Speicher zu ${usage.usedMB} MB belegt.` };
            }
            return { success: true };
        } catch (err: unknown) {
            const payload = err as { name?: string; code?: number };
            if (payload?.name === 'QuotaExceededError' || payload?.code === 22) {
                return { success: false, warning: 'Speicher voll! Das Dokument konnte nicht gespeichert werden. Bitte löschen Sie alte Dokumente.' };
            }
            console.error('Save failed:', err);
            return { success: false, warning: 'Unbekannter Fehler beim Speichern.' };
        }
    },

    getDocContent(id: string): string | null {
        return localStorage.getItem(`sepoffice_doc_${id}`);
    },

    deleteDoc(id: string) {
        const docs = this.getRecentDocs();
        const filtered = docs.filter(d => d.id !== id);
        localStorage.setItem('sepoffice_recent_docs', JSON.stringify(filtered));
        localStorage.removeItem(`sepoffice_doc_${id}`);
    }
};
