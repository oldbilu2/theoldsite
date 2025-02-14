const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const os = require('os');
const app = express();

// Configurações
const PORT = process.env.PORT || 8080;
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, '../frontend')));

// Usar pasta temporária do sistema
const DATA_PATH = path.join(process.cwd(), 'data');
const NOTE_FILE = path.join(DATA_PATH, 'note.txt');
const HISTORY_FILE = path.join(DATA_PATH, 'history.json');

console.log('DATA_PATH:', DATA_PATH);
console.log('NOTE_FILE:', NOTE_FILE);
console.log('HISTORY_FILE:', HISTORY_FILE);

// Criar pasta e arquivos
try {
    if (!fs.existsSync(DATA_PATH)) {
        fs.mkdirSync(DATA_PATH, { recursive: true });
        console.log('Pasta de dados criada:', DATA_PATH);
    }
    if (!fs.existsSync(NOTE_FILE)) {
        fs.writeFileSync(NOTE_FILE, 'Sistema Exclusivo THE OLD', 'utf8');
        console.log('Arquivo de nota criado:', NOTE_FILE);
    }
    if (!fs.existsSync(HISTORY_FILE)) {
        fs.writeFileSync(HISTORY_FILE, '[]', 'utf8');
        console.log('Arquivo de histórico criado:', HISTORY_FILE);
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
    console.log('Dados carregados com sucesso');
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
        console.error('Erro ao ler nota:', error);
        res.json({ content: savedNote });
    }
});

app.post('/api/note', (req, res) => {
    try {
        console.log('Recebendo requisição POST /api/note');
        const { content, username } = req.body;
        
        if (!content) {
            console.error('Conteúdo vazio recebido');
            return res.status(400).json({ 
                success: false, 
                error: 'Conteúdo não pode estar vazio' 
            });
        }

        console.log('Salvando nova nota...');
        
        // Salvar nota
        fs.writeFileSync(NOTE_FILE, content, 'utf8');
        savedNote = content;
        console.log('Nota salva com sucesso');

        // Atualizar histórico
        const ip = req.ip || req.connection.remoteAddress;
        const newEntry = {
            timestamp: new Date(),
            username,
            oldContent: savedNote,
            newContent: content,
            ip
        };
        
        editHistory.push(newEntry);
        fs.writeFileSync(HISTORY_FILE, JSON.stringify(editHistory, null, 2), 'utf8');
        console.log('Histórico atualizado com sucesso');

        res.json({ success: true });
    } catch (error) {
        console.error('Erro ao salvar nota:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Erro ao salvar nota',
            details: error.message 
        });
    }
});

app.get('/api/history', (req, res) => {
    try {
        editHistory = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
        res.json(editHistory);
    } catch (error) {
        console.error('Erro ao ler histórico:', error);
        res.json([]);
    }
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Pasta de dados: ${DATA_PATH}`);
});
