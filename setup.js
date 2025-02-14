const fs = require('fs');
const path = require('path');

// Cria a estrutura inicial
const DATA_PATH = path.join(__dirname, 'backend', 'data');
const NOTE_FILE = path.join(DATA_PATH, 'note.txt');
const HISTORY_FILE = path.join(DATA_PATH, 'history.json');

// Cria diretório se não existir
if (!fs.existsSync(DATA_PATH)) {
    fs.mkdirSync(DATA_PATH, { recursive: true });
    console.log('Diretório de dados criado:', DATA_PATH);
}

// Cria arquivo de nota se não existir
if (!fs.existsSync(NOTE_FILE)) {
    fs.writeFileSync(NOTE_FILE, 'Sistema Exclusivo THE OLD', 'utf8');
    console.log('Arquivo de nota criado:', NOTE_FILE);
}

// Cria arquivo de histórico se não existir
if (!fs.existsSync(HISTORY_FILE)) {
    fs.writeFileSync(HISTORY_FILE, '[]', 'utf8');
    console.log('Arquivo de histórico criado:', HISTORY_FILE);
}

console.log('Setup concluído com sucesso!'); 