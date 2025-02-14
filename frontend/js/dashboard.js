// URL da API
const API_URL = window.location.origin;

// Variáveis globais
let isEditing = false;
let currentContent = '';

// Função para verificar se um elemento existe
function elementExists(id) {
    return document.getElementById(id) !== null;
}

// Carrega o conteúdo inicial e atualiza periodicamente
function loadContent() {
    if (!elementExists('noteContent')) return;

    fetch(`${API_URL}/api/note`)
        .then(response => response.json())
        .then(data => {
            if (!isEditing) {
                const noteContent = document.getElementById('noteContent');
                noteContent.innerHTML = data.content;
                currentContent = data.content;
            }
        })
        .catch(error => console.error('Erro ao carregar conteúdo:', error));
}

// Inicialização segura
document.addEventListener('DOMContentLoaded', function() {
    // Carrega conteúdo inicial
    loadContent();

    // Configura os event listeners
    if (elementExists('verHistoricoBtn')) {
        document.getElementById('verHistoricoBtn').addEventListener('click', function() {
            if (elementExists('loginModal')) {
                document.getElementById('loginModal').style.display = 'block';
            }
        });
    }

    if (elementExists('loginForm')) {
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
    }

    // Configura o upload de mídia
    if (elementExists('mediaUpload')) {
        document.getElementById('mediaUpload').addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.style.maxWidth = '100%';
                    if (elementExists('noteContent')) {
                        document.getElementById('noteContent').appendChild(img);
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Configura os botões de fechar modal
    document.querySelectorAll('.close').forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) modal.style.display = 'none';
        });
    });

    // Clique fora do modal
    window.onclick = function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    };

    // Atualização periódica
    setInterval(loadContent, 5000);
});

// Função para alternar modo de edição
function toggleEdit() {
    if (!elementExists('noteContent')) return;

    const noteContent = document.getElementById('noteContent');
    const editButton = document.getElementById('editButton');
    const saveButton = document.getElementById('saveButton');
    const cancelButton = document.getElementById('cancelButton');
    const mediaUploadContainer = document.getElementById('mediaUploadContainer');

    if (!isEditing && noteContent && editButton && saveButton && cancelButton && mediaUploadContainer) {
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
    if (!elementExists('noteContent')) return;

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
            loadContent();
        } else {
            alert(data.error || 'Erro ao salvar alterações');
        }
    })
    .catch(error => {
        console.error('Erro:', error);
        alert('Erro ao salvar alterações. Tente novamente.');
    });
}

// Função para cancelar edição
function cancelEdit() {
    if (!elementExists('noteContent')) return;
    
    const noteContent = document.getElementById('noteContent');
    noteContent.innerHTML = currentContent;
    exitEditMode();
}

// Função para sair do modo de edição
function exitEditMode() {
    if (!elementExists('noteContent')) return;

    const noteContent = document.getElementById('noteContent');
    const editButton = document.getElementById('editButton');
    const saveButton = document.getElementById('saveButton');
    const cancelButton = document.getElementById('cancelButton');
    const mediaUploadContainer = document.getElementById('mediaUploadContainer');

    if (noteContent && editButton && saveButton && cancelButton && mediaUploadContainer) {
        noteContent.contentEditable = false;
        editButton.style.display = 'inline-block';
        saveButton.style.display = 'none';
        cancelButton.style.display = 'none';
        mediaUploadContainer.style.display = 'none';
        isEditing = false;
    }
}
