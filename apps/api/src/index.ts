import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const DB_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR);
}
const DB_FILE = path.join(DB_DIR, 'document.sepw');
const GRID_FILE = path.join(DB_DIR, 'grid.sepw');

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'api' });
});

app.get('/api/document', (req, res) => {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      res.json({ content: data });
    } else {
      res.json({ content: '' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to read document' });
  }
});

app.post('/api/document', (req, res) => {
  try {
    const { content } = req.body;
    fs.writeFileSync(DB_FILE, content, 'utf-8');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save document' });
  }
});

app.get('/api/grid', (req, res) => {
  try {
    if (fs.existsSync(GRID_FILE)) {
      const data = fs.readFileSync(GRID_FILE, 'utf-8');
      res.json({ content: data });
    } else {
      res.json({ content: '' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to read grid' });
  }
});

app.post('/api/grid', (req, res) => {
  try {
    const { content } = req.body;
    fs.writeFileSync(GRID_FILE, content, 'utf-8');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save grid' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend API running on http://localhost:${PORT}`);
});
