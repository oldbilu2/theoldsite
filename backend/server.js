const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const app = express();

// Configurações
const PORT = process.env.PORT || 8080;
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));
app.use(express.json({ limit: '50mb' }));
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
    fs.writeFileSync(NOTE_FILE, 'Sistema Exclusivo THE OLD', { encoding: 'utf8' });
}

if (!fs.existsSync(HISTORY_FILE)) {
    fs.writeFileSync(HISTORY_FILE, '[]', { encoding: 'utf8' });
}

// Carregar dados salvos
let savedNote = '';
let editHistory = [];

try {
    savedNote = fs.readFileSync(NOTE_FILE, 'utf8');
    editHistory = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
} catch (error) {
    console.error('Erro ao carregar dados iniciais:', error);
    savedNote = 'Sistema Exclusivo THE OLD';
    editHistory = [];
}

// Rotas
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('/pages/dashboard.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pages/dashboard.html'));
});

// Rota para obter o conteúdo atual
app.get('/api/note', (req, res) => {
    try {
        // Recarrega do arquivo para garantir dados atualizados
        savedNote = fs.readFileSync(NOTE_FILE, 'utf8');
        res.json({ content: savedNote });
    } catch (error) {
        console.error('Erro ao ler nota:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Erro ao ler nota',
            details: error.message 
        });
    }
});

// Rota para salvar alterações
app.post('/api/note', async (req, res) => {
    try {
        const { content, username } = req.body;
        
        if (!content) {
            return res.status(400).json({ 
                success: false, 
                error: 'Conteúdo não pode estar vazio' 
            });
        }

        let ip = req.headers['x-forwarded-for'] || 
                req.connection.remoteAddress || 
                req.socket.remoteAddress;
        
        if (ip.substr(0, 7) == "::ffff:") {
            ip = ip.substr(7);
        }

        // Garante que a pasta data existe
        if (!fs.existsSync(DATA_PATH)) {
            fs.mkdirSync(DATA_PATH, { recursive: true });
        }

        // Carrega histórico atual
        try {
            editHistory = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
        } catch (e) {
            console.error('Erro ao ler histórico, iniciando novo:', e);
            editHistory = [];
        }

        // Adiciona nova entrada ao histórico
        editHistory.push({
            timestamp: new Date(),
            username: username,
            oldContent: savedNote,
            newContent: content,
            ip: ip
        });

        // Salva os dados
        fs.writeFileSync(NOTE_FILE, content, { encoding: 'utf8', flag: 'w' });
        fs.writeFileSync(HISTORY_FILE, JSON.stringify(editHistory, null, 2), { encoding: 'utf8' });
        
        // Atualiza variável em memória
        savedNote = content;

        res.json({ success: true });
    } catch (error) {
        console.error('Erro ao salvar:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Erro ao salvar nota',
            details: error.message 
        });
    }
});

// Rota para obter o histórico
app.get('/api/history', (req, res) => {
    try {
        // Recarrega do arquivo para garantir dados atualizados
        editHistory = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
        res.json(editHistory);
    } catch (error) {
        console.error('Erro ao ler histórico:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Erro ao ler histórico',
            details: error.message 
        });
    }
});

// Tratamento de erros
app.use((err, req, res, next) => {
    console.error('Erro não tratado:', err.stack);
    res.status(500).json({ 
        success: false, 
        error: 'Erro interno do servidor',
        details: err.message 
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Pasta de dados: ${DATA_PATH}`);
    console.log('Servidor iniciado com sucesso!');
});
