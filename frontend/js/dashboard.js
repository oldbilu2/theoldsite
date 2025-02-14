document.addEventListener('DOMContentLoaded', function() {
    const API_URL = window.location.origin;
    let isEditing = false;
    let currentContent = '';

    // Função para carregar conteúdo
    function loadContent() {
        fetch(`${API_URL}/api/note`)
            .then(response => response.json())
            .then(data => {
                if (!isEditing && data.content) {
                    document.getElementById('noteContent').innerHTML = data.content;
                    currentContent = data.content;
                }
            })
            .catch(console.error);
    }

    // Carregar conteúdo inicial
    loadContent();
    
    // Atualizar a cada 5 segundos
    setInterval(loadContent, 5000);

    // Botão de editar
    document.getElementById('editButton').onclick = function() {
        const noteContent = document.getElementById('noteContent');
        noteContent.contentEditable = true;
        noteContent.focus();
        this.style.display = 'none';
        document.getElementById('saveButton').style.display = 'inline-block';
        document.getElementById('cancelButton').style.display = 'inline-block';
        document.getElementById('mediaUploadContainer').style.display = 'block';
        isEditing = true;
    };

    // Botão de salvar
    document.getElementById('saveButton').onclick = function() {
        const content = document.getElementById('noteContent').innerHTML;
        
        fetch(`${API_URL}/api/note`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content, username: 'imold' })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                isEditing = false;
                currentContent = content;
                document.getElementById('editButton').style.display = 'inline-block';
                document.getElementById('saveButton').style.display = 'none';
                document.getElementById('cancelButton').style.display = 'none';
                document.getElementById('mediaUploadContainer').style.display = 'none';
                document.getElementById('noteContent').contentEditable = false;
            } else {
                alert('Erro ao salvar');
            }
        })
        .catch(() => alert('Erro ao salvar'));
    };

    // Botão de cancelar
    document.getElementById('cancelButton').onclick = function() {
        document.getElementById('noteContent').innerHTML = currentContent;
        document.getElementById('noteContent').contentEditable = false;
        document.getElementById('editButton').style.display = 'inline-block';
        document.getElementById('saveButton').style.display = 'none';
        this.style.display = 'none';
        document.getElementById('mediaUploadContainer').style.display = 'none';
        isEditing = false;
    };

    // Botão de ver histórico
    document.getElementById('verHistoricoBtn').onclick = function() {
        document.getElementById('loginModal').style.display = 'block';
    };

    // Login para histórico
    document.getElementById('loginForm').onsubmit = function(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (username === "imold" && password === "letonio123") {
            document.getElementById('loginModal').style.display = 'none';
            
            // Carregar histórico
            fetch(`${API_URL}/api/history`)
                .then(response => response.json())
                .then(history => {
                    const historyEntries = document.querySelector('.history-entries');
                    historyEntries.innerHTML = '';
                    
                    history.reverse().forEach(entry => {
                        const timestamp = new Date(entry.timestamp).toLocaleString('pt-BR');
                        historyEntries.innerHTML += `
                            <div class="history-entry">
                                <div class="history-entry-info">
                                    <div class="history-main-info">
                                        <div class="history-timestamp">🕒 ${timestamp}</div>
                                        <div class="history-user">👤 ${entry.username}</div>
                                        <div class="history-ip">🌐 ${entry.ip}</div>
                                    </div>
                                </div>
                            </div>
                        `;
                    });
                    
                    document.getElementById('historyContainer').style.display = 'block';
                })
                .catch(console.error);
        }
    };

    // Fechar modais
    document.querySelectorAll('.close').forEach(btn => {
        btn.onclick = function() {
            this.closest('.modal').style.display = 'none';
        };
    });

    // Upload de mídia
    document.getElementById('mediaUpload').onchange = function(e) {
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
    };
});
