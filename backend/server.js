const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const app = express();

// Configurações
const PORT = process.env.PORT || 8080;
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Caminhos para os arquivos de dados
const DATA_PATH = path.join(__dirname, 'data');
const NOTE_FILE = path.join(DATA_PATH, 'note.txt');
const HISTORY_FILE = path.join(DATA_PATH, 'history.json');

// Criar pasta de dados se não existir
if (!fs.existsSync(DATA_PATH)) {
    fs.mkdirSync(DATA_PATH);
}

// Carregar dados salvos
let savedNote = '';
let editHistory = [];

try {
    if (fs.existsSync(NOTE_FILE)) {
        savedNote = fs.readFileSync(NOTE_FILE, 'utf8');
    }
    if (fs.existsSync(HISTORY_FILE)) {
        editHistory = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
    }
} catch (error) {
    console.error('Erro ao carregar dados:', error);
}

// Rotas
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('/api/note', (req, res) => {
    res.json({ content: savedNote });
});

app.post('/api/note', async (req, res) => {
    try {
        let ip = req.headers['x-forwarded-for'] || 
                req.connection.remoteAddress || 
                req.socket.remoteAddress;
        
        if (ip.substr(0, 7) == "::ffff:") {
            ip = ip.substr(7);
        }

        const { content, username } = req.body;
        
        // Salvar histórico
        editHistory.push({
            timestamp: new Date(),
            username: username,
            oldContent: savedNote,
            newContent: content,
            ip: ip
        });

        // Atualizar nota
        savedNote = content;

        // Salvar em arquivo
        fs.writeFileSync(NOTE_FILE, savedNote);
        fs.writeFileSync(HISTORY_FILE, JSON.stringify(editHistory));
        
        res.json({ success: true });
    } catch (error) {
        console.error('Erro:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Erro ao salvar nota',
            details: error.message 
        });
    }
});

app.get('/api/history', (req, res) => {
    res.json(editHistory);
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
