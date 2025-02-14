const usuarios = [
    { login: 'imold', senha: 'letonio123' },
    { login: 'sakai', senha: 'letonio123' },
    { login: 'osint', senha: 'letonio123' },
    { login: 'clonus', senha: 'letonio123' }
];

// Verifica se já está logado
if (sessionStorage.getItem('loggedIn')) {
    document.location = 'pages/dashboard.html';
}

function verificarLogin() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('error-message');

    if (password === 'letonio123' && 
        (username === 'imold' || 
         username === 'sakai' || 
         username === 'osint' || 
         username === 'clonus')) {
        sessionStorage.setItem('loggedIn', 'true');
        sessionStorage.setItem('username', username);
        document.location = 'pages/dashboard.html';
    } else {
        errorMessage.style.display = 'block';
    }
}

// Esconde a mensagem de erro quando o usuário começa a digitar
document.getElementById('username').addEventListener('input', function() {
    document.getElementById('error-message').style.display = 'none';
});

document.getElementById('password').addEventListener('input', function() {
    document.getElementById('error-message').style.display = 'none';
});

// Permite usar Enter para fazer login
document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        verificarLogin();
    }
}); 