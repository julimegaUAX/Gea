// === Cambio de vista Login/Register ===
const container = document.getElementById('container');
const registerBtn = document.getElementById('register');
const loginBtn = document.getElementById('login');

registerBtn.addEventListener('click', () => {
    container.classList.add("active");
});

loginBtn.addEventListener('click', () => {
    container.classList.remove("active");
});

const signupForm = document.getElementById('signup-form');
const loginForm = document.getElementById('login-form');
const forgotPasswordLink = document.getElementById('forgot-password-link');
const resetPasswordPanel = document.getElementById('reset-password-panel');
const resetPasswordBtn = document.getElementById('reset-password-btn');
const API_BASE_URL = 'http://127.0.0.1:5001/GEA';

async function postJson(url, body) {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Ocurrio un error');
    }

    return data;
}

signupForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const nombre = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;

    try {
        const result = await postJson(`${API_BASE_URL}/signup`, { nombre, email, password });
        alert(result.message);
        signupForm.reset();
        container.classList.remove('active');
    } catch (error) {
        alert(error.message);
    }
});

loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    try {
        const result = await postJson(`${API_BASE_URL}/login`, { email, password });
        localStorage.setItem('gea_user', JSON.stringify(result.user));
        alert(result.message);
        window.location.href = '../index.html';
    } catch (error) {
        alert(error.message);
    }
});

forgotPasswordLink?.addEventListener('click', function (event) {
    event.preventDefault();
    resetPasswordPanel?.classList.toggle('active');
});

resetPasswordBtn?.addEventListener('click', async function () {
    const email = document.getElementById('reset-email').value.trim();
    const password = document.getElementById('reset-password').value;
    const passwordConfirm = document.getElementById('reset-password-confirm').value;

    if (!email || !password || !passwordConfirm) {
        alert('Completa todos los campos para restablecer la contraseña');
        return;
    }

    if (password.length < 6) {
        alert('La nueva contraseña debe tener al menos 6 caracteres');
        return;
    }

    if (password !== passwordConfirm) {
        alert('Las contraseñas no coinciden');
        return;
    }

    try {
        const result = await postJson(`${API_BASE_URL}/reset-password`, { email, password });
        alert(result.message);
        document.getElementById('reset-password').value = '';
        document.getElementById('reset-password-confirm').value = '';
        resetPasswordPanel.classList.remove('active');
    } catch (error) {
        alert(error.message);
    }
});

// Menú desplegable activado
document.getElementById('menu-icon').addEventListener('click', function() {
    const menu = document.querySelector('.menu-desplegable');
    const overlay = document.getElementById('menu-overlay');
    const menuIcon = document.getElementById('menu-icon');
    const closeIcon = document.getElementById('close-icon');
    
    menu.classList.add('active');
    overlay.classList.add('active');
    menuIcon.style.display = 'none';
    closeIcon.style.display = 'block';
    document.body.style.overflow = 'hidden';
});

// Función para cerrar el menú
function cerrarMenu() {
    const menu = document.querySelector('.menu-desplegable');
    const overlay = document.getElementById('menu-overlay');
    const menuIcon = document.getElementById('menu-icon');
    const closeIcon = document.getElementById('close-icon');
    
    menu.classList.remove('active');
    overlay.classList.remove('active');
    menuIcon.style.display = 'block';
    closeIcon.style.display = 'none';
    document.body.style.overflow = 'auto';
}
document.getElementById('close-icon').addEventListener('click', cerrarMenu);
document.getElementById('menu-overlay').addEventListener('click', cerrarMenu);