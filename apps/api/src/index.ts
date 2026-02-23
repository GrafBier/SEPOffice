import express from 'express';
import cors from 'cors';
import path from 'path';
import sqlite3 from 'sqlite3';
import { promisify } from 'util';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: '50mb' })); // Allow large documents

const DB_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DB_DIR, 'sepoffice.db');

// Ensure data directory exists
const fs = require('fs');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const db = new sqlite3.Database(DB_FILE);

// Promisify database operations
const dbRun = (sql: string, params: any[] = []) => new Promise<void>((res, rej) => db.run(sql, params, (err) => err ? rej(err) : res()));
const dbAll = (sql: string, params: any[] = []) => new Promise<any[]>((res, rej) => db.all(sql, params, (err, rows) => err ? rej(err) : res(rows)));
const dbGet = (sql: string, params: any[] = []) => new Promise<any>((res, rej) => db.get(sql, params, (err, row) => err ? rej(err) : res(row)));

async function initDb() {
  await dbRun(`
    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      name TEXT,
      type TEXT,
      content TEXT,
      updatedAt INTEGER
    )
  `);
  console.log('SQLite Database initialized at', DB_FILE);
}

initDb().catch(console.error);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'api', database: 'sqlite' });
});

// List all documents (metadata only)
app.get('/api/documents', async (req, res) => {
  try {
    const docs = await dbAll(`SELECT id, name, type, updatedAt FROM documents ORDER BY updatedAt DESC`);
    res.json(docs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to list documents' });
  }
});

// Get single document content
app.get('/api/documents/:id', async (req, res) => {
  try {
    const doc = await dbGet(`SELECT content, name, type FROM documents WHERE id = ?`, [req.params.id]);
    if (doc) {
      res.json(doc);
    } else {
      res.status(404).json({ error: 'Document not found' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to read document' });
  }
});

// Save or Update document
app.post('/api/documents', async (req, res) => {
  try {
    const { id, name, type, content } = req.body;
    const updatedAt = Date.now();

    await dbRun(
      `INSERT INTO documents (id, name, type, content, updatedAt) 
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET 
         name=excluded.name, 
         type=excluded.type, 
         content=excluded.content, 
         updatedAt=excluded.updatedAt`,
      [id, name, type, content, updatedAt]
    );

    res.json({ success: true, id });
  } catch (err) {
    console.error('Save error:', err);
    res.status(500).json({ error: 'Failed to save document' });
  }
});

// Delete document
app.delete('/api/documents/:id', async (req, res) => {
  try {
    await dbRun(`DELETE FROM documents WHERE id = ?`, [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend API with SQL running on http://localhost:${PORT}`);
});
