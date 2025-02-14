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

// Criar pasta e arquivos se não existirem
if (!fs.existsSync(DATA_PATH)) {
    fs.mkdirSync(DATA_PATH, { recursive: true });
}

if (!fs.existsSync(NOTE_FILE)) {
    fs.writeFileSync(NOTE_FILE, 'Sistema Exclusivo THE OLD');
}

if (!fs.existsSync(HISTORY_FILE)) {
    fs.writeFileSync(HISTORY_FILE, '[]');
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
    try {
        // Recarrega a nota do arquivo a cada requisição
        if (fs.existsSync(NOTE_FILE)) {
            savedNote = fs.readFileSync(NOTE_FILE, 'utf8');
        }
        res.json({ content: savedNote });
    } catch (error) {
        console.error('Erro ao ler nota:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Erro ao ler nota'
        });
    }
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
        
        // Recarrega o histórico antes de adicionar nova entrada
        if (fs.existsSync(HISTORY_FILE)) {
            editHistory = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
        }

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
        fs.writeFileSync(HISTORY_FILE, JSON.stringify(editHistory, null, 2));
        
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
    try {
        // Recarrega o histórico a cada requisição
        if (fs.existsSync(HISTORY_FILE)) {
            editHistory = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
        }
        res.json(editHistory);
    } catch (error) {
        console.error('Erro ao ler histórico:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Erro ao ler histórico'
        });
    }
});

// Tratamento de erros
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        success: false, 
        error: 'Erro interno do servidor'
    });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Pasta de dados: ${DATA_PATH}`);
});
