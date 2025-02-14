// Carrega o conteúdo inicial quando a página carrega
window.onload = function() {
    fetch(`${window.location.origin}/api/note`)
        .then(response => response.json())
        .then(data => {
            const noteContent = document.getElementById('noteContent');
            if (data.content) {
                noteContent.innerHTML = data.content;
            }
        })
        .catch(error => {
            console.error('Erro ao carregar conteúdo:', error);
        });
};

// Função para salvar alterações
function saveChanges() {
    const noteContent = document.getElementById('noteContent');
    const content = noteContent.innerHTML;

    fetch(`${window.location.origin}/api/note`, {
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
            // Recarrega o conteúdo após salvar
            window.location.reload();
        } else {
            alert('Erro ao salvar alterações');
        }
    })
    .catch(error => {
        console.error('Erro:', error);
        alert('Erro ao salvar alterações');
    });
}

// ... resto do código existente ...

// Atualiza o conteúdo a cada 30 segundos
setInterval(() => {
    fetch(`${window.location.origin}/api/note`)
        .then(response => response.json())
        .then(data => {
            if (!isEditing) { // Só atualiza se não estiver editando
                const noteContent = document.getElementById('noteContent');
                if (data.content) {
                    noteContent.innerHTML = data.content;
                }
            }
        })
        .catch(error => {
            console.error('Erro ao atualizar conteúdo:', error);
        });
}, 30000); // 30 segundos
