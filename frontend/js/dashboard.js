// Mudar de localhost para URL dinâmica
const API_URL = window.location.origin;

// Função para mostrar o modal de login com animação
document.getElementById('verHistoricoBtn').addEventListener('click', function() {
    const loginModal = document.getElementById('loginModal');
    loginModal.style.display = 'block';
    loginModal.classList.add('show');
});

// Animação de erro no login
document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username === "imold" && password === "letonio123") {
        this.classList.remove('error-shake');
        document.getElementById('loginModal').style.display = 'none';
        fetchAndShowHistory();
    } else {
        this.classList.add('error-shake');
        setTimeout(() => {
            this.classList.remove('error-shake');
        }, 500);
    }
});

// Efeito de hover nos ícones de aviso
document.querySelectorAll('.warning-icon').forEach(icon => {
    icon.addEventListener('mouseover', function() {
        this.style.transform = 'scale(1.2) rotate(10deg)';
    });
    
    icon.addEventListener('mouseout', function() {
        this.style.transform = 'scale(1)';
    });
}); 