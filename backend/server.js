const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

// Configurações
const PORT = process.env.PORT || 8080;
app.use(cors());
app.use(express.json());

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, '../frontend')));

// Variáveis para armazenar dados (em produção, use um banco de dados)
let savedNote = '';
let editHistory = [];

// Rota principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pages/dashboard.html'));
});

// Suas rotas API existentes
app.get('/api/note', (req, res) => {
    res.json({ content: savedNote });
});

app.post('/api/note', (req, res) => {
    try {
        let ip = req.headers['x-forwarded-for'] || 
                req.connection.remoteAddress || 
                req.socket.remoteAddress;
        
        if (ip.substr(0, 7) == "::ffff:") {
            ip = ip.substr(7);
        }

        const { content, username } = req.body;
        
        editHistory.push({
            timestamp: new Date(),
            username: username,
            oldContent: savedNote,
            newContent: content,
            ip: ip
        });

        savedNote = content;
        res.json({ success: true });
    } catch (error) {
        console.error('Erro:', error);
        res.status(500).json({ success: false, error: 'Erro ao salvar nota' });
    }
});

app.get('/api/history', (req, res) => {
    res.json(editHistory);
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});