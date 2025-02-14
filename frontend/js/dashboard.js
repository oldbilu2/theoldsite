// URL da API
const API_URL = window.location.origin;

// Variáveis globais
let isEditing = false;
let currentContent = '';

// Carrega o conteúdo inicial e atualiza periodicamente
function loadContent() {
    fetch(`${API_URL}/api/note`)
        .then(response => response.json())
        .then(data => {
            if (!isEditing) { // Só atualiza se não estiver editando
                const noteContent = document.getElementById('noteContent');
                noteContent.innerHTML = data.content;
                currentContent = data.content;
            }
        })
        .catch(error => console.error('Erro ao carregar conteúdo:', error));
}

// Carrega conteúdo inicial
window.onload = loadContent;

// Atualiza a cada 5 segundos
setInterval(loadContent, 5000);

// Função para alternar modo de edição
function toggleEdit() {
    const noteContent = document.getElementById('noteContent');
    const editButton = document.getElementById('editButton');
    const saveButton = document.getElementById('saveButton');
    const cancelButton = document.getElementById('cancelButton');
    const mediaUploadContainer = document.getElementById('mediaUploadContainer');

    if (!isEditing) {
        noteContent.contentEditable = true;
        noteContent.focus();
        editButton.style.display = 'none';
        saveButton.style.display = 'inline-block';
        cancelButton.style.display = 'inline-block';
        mediaUploadContainer.style.display = 'block';
        isEditing = true;
    }
}

// Função para salvar alterações
function saveChanges() {
    const noteContent = document.getElementById('noteContent');
    const content = noteContent.innerHTML;

    fetch(`${API_URL}/api/note`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            content: content,
            username: 'imold'
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            exitEditMode();
            currentContent = content;
            loadContent(); // Recarrega o conteúdo após salvar
        } else {
            alert('Erro ao salvar alterações');
        }
    })
    .catch(error => {
        console.error('Erro:', error);
        alert('Erro ao salvar alterações');
    });
}

// Função para cancelar edição
function cancelEdit() {
    const noteContent = document.getElementById('noteContent');
    noteContent.innerHTML = currentContent;
    exitEditMode();
}

// Função para sair do modo de edição
function exitEditMode() {
    const noteContent = document.getElementById('noteContent');
    const editButton = document.getElementById('editButton');
    const saveButton = document.getElementById('saveButton');
    const cancelButton = document.getElementById('cancelButton');
    const mediaUploadContainer = document.getElementById('mediaUploadContainer');

    noteContent.contentEditable = false;
    editButton.style.display = 'inline-block';
    saveButton.style.display = 'none';
    cancelButton.style.display = 'none';
    mediaUploadContainer.style.display = 'none';
    isEditing = false;
}

// Função para buscar e mostrar o histórico
function fetchAndShowHistory() {
    fetch(`${API_URL}/api/history`)
        .then(response => response.json())
        .then(history => {
            const historyEntries = document.querySelector('.history-entries');
            historyEntries.innerHTML = '';
            
            history.reverse().forEach((entry, index) => {
                const timestamp = new Date(entry.timestamp).toLocaleString('pt-BR');
                
                const entryDiv = document.createElement('div');
                entryDiv.className = 'history-entry';
                entryDiv.innerHTML = `
                    <div class="history-entry-info">
                        <div class="history-main-info">
                            <div class="history-timestamp">
                                <span class="time-icon">🕒</span>
                                ${timestamp}
                            </div>
                            <div class="history-user">
                                <span class="user-icon">👤</span>
                                ${entry.username || 'Usuário Desconhecido'}
                            </div>
                            <div class="history-ip">
                                <span class="ip-icon">🌐</span>
                                ${entry.ip || 'IP não registrado'}
                            </div>
                        </div>
                        <button class="view-changes-btn" onclick="showChanges(${index})">
                            Ver Alterações
                        </button>
                    </div>
                `;
                
                historyEntries.appendChild(entryDiv);
            });
            
            document.getElementById('historyContainer').style.display = 'block';
        })
        .catch(error => {
            console.error('Erro ao carregar histórico:', error);
            alert('Erro ao carregar o histórico');
        });
}

// Event Listeners
document.getElementById('verHistoricoBtn').addEventListener('click', function() {
    document.getElementById('loginModal').style.display = 'block';
});

document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username === "imold" && password === "letonio123") {
        document.getElementById('loginModal').style.display = 'none';
        fetchAndShowHistory();
    } else {
        this.classList.add('error-shake');
        setTimeout(() => {
            this.classList.remove('error-shake');
        }, 500);
    }
});

// Fechar modais
document.querySelectorAll('.close').forEach(btn => {
    btn.addEventListener('click', function() {
        this.closest('.modal').style.display = 'none';
    });
});

window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
};

// Upload de mídia
document.getElementById('mediaUpload').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.style.maxWidth = '100%';
            document.getElementById('noteContent').appendChild(img);
        };
        reader.readAsDataURL(file);
    }
});
