/**
 * persistenceService (SQL API Edition)
 * - Migrated from localStorage to SQLite via the Backend API (Port 4000).
 * - All operations are now async.
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

const API_BASE = "http://localhost:4000/api";

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const persistenceService = {
    async getRecentDocs(retries = 3): Promise<DocMetadata[]> {
        for (let i = 0; i < retries; i++) {
            try {
                const res = await fetch(`${API_BASE}/documents`);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return await res.json();
            } catch (err) {
                console.warn(`API unavailable (Attempt ${i + 1}/${retries}), retrying...`, err);
                if (i < retries - 1) await wait(1000); // 1s warten vor nächstem Versuch
            }
        }
        console.error("API permanently unavailable after retries.");
        return [];
    },

    /**
     * Storage usage is now handled by the OS/SQL, 
     * but we provide a mock for UI compatibility where needed.
     */
    getStorageUsage() {
        return { usedBytes: 0, usedMB: "SQL", warningLevel: 'ok' as const };
    },

    async saveDoc(id: string, name: string, type: 'write' | 'grid' | 'show', content: string): Promise<SaveResult> {
        try {
            const res = await fetch(`${API_BASE}/documents`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, name, type, content }),
            });

            if (res.ok) {
                return { success: true };
            }
            return { success: false, warning: 'Fehler beim Speichern in der Datenbank.' };
        } catch (err) {
            console.error('SQL Save failed:', err);
            return { success: false, warning: 'Verbindung zum Backend fehlgeschlagen.' };
        }
    },

    async getDocContent(id: string): Promise<string | null> {
        try {
            const res = await fetch(`${API_BASE}/documents/${id}`);
            if (!res.ok) return null;
            const data = await res.json();
            return data.content || null;
        } catch (err) {
            console.error("SQL Load failed:", err);
            return null;
        }
    },

    async deleteDoc(id: string): Promise<boolean> {
        try {
            const res = await fetch(`${API_BASE}/documents/${id}`, {
                method: "DELETE"
            });
            return res.ok;
        } catch (err) {
            console.error("SQL Delete failed:", err);
            return false;
        }
    }
};
