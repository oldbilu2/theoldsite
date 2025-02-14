const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const os = require('os');
const app = express();

// Configurações
const PORT = process.env.PORT || 8080;
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Usar pasta temporária do sistema
const DATA_PATH = path.join(os.tmpdir(), 'the-old-data');
const NOTE_FILE = path.join(DATA_PATH, 'note.txt');
const HISTORY_FILE = path.join(DATA_PATH, 'history.json');

// Criar pasta e arquivos
try {
    if (!fs.existsSync(DATA_PATH)) {
        fs.mkdirSync(DATA_PATH);
    }
    if (!fs.existsSync(NOTE_FILE)) {
        fs.writeFileSync(NOTE_FILE, 'Sistema Exclusivo THE OLD');
    }
    if (!fs.existsSync(HISTORY_FILE)) {
        fs.writeFileSync(HISTORY_FILE, '[]');
    }
} catch (error) {
    console.error('Erro ao criar arquivos:', error);
}

// Carregar dados
let savedNote = 'Sistema Exclusivo THE OLD';
let editHistory = [];

try {
    savedNote = fs.readFileSync(NOTE_FILE, 'utf8');
    editHistory = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
} catch (error) {
    console.error('Erro ao carregar dados:', error);
}

// Rotas
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('/api/note', (req, res) => {
    try {
        savedNote = fs.readFileSync(NOTE_FILE, 'utf8');
        res.json({ content: savedNote });
    } catch (error) {
        res.json({ content: savedNote });
    }
});

app.post('/api/note', (req, res) => {
    try {
        const { content, username } = req.body;
        const ip = req.ip || req.connection.remoteAddress;

        // Salvar nota
        fs.writeFileSync(NOTE_FILE, content);
        savedNote = content;

        // Atualizar histórico
        editHistory.push({
            timestamp: new Date(),
            username,
            oldContent: savedNote,
            newContent: content,
            ip
        });
        fs.writeFileSync(HISTORY_FILE, JSON.stringify(editHistory));

        res.json({ success: true });
    } catch (error) {
        console.error('Erro:', error);
        res.status(500).json({ success: false });
    }
});

app.get('/api/history', (req, res) => {
    try {
        editHistory = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
        res.json(editHistory);
    } catch (error) {
        res.json([]);
    }
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Pasta de dados: ${DATA_PATH}`);
});
