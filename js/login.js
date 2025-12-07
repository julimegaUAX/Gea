// Login container toggle
const container = document.getElementById('container');
const registerBtn = document.getElementById('register');
const loginBtn = document.getElementById('login');

registerBtn.addEventListener('click', () => {
    container.classList.add("active");
});

loginBtn.addEventListener('click', () => {
    container.classList.remove("active");
});

// Mobile menu toggle
const menuIcon = document.getElementById('menu-icon');
const menuDesplegable = document.getElementById('menu-desplegable');
const menuOverlay = document.getElementById('menu-overlay');

menuIcon.addEventListener('click', () => {
    const isActive = menuDesplegable.classList.toggle('active');
    menuOverlay.classList.toggle('active');
    
    // Cambiar icono
    if (isActive) {
        menuIcon.src = '../img/assets/menu/close.svg';
        menuIcon.alt = 'Close Icon';
        document.body.style.overflow = 'hidden';
    } else {
        menuIcon.src = '../img/assets/menu/menu.svg';
        menuIcon.alt = 'Menu Icon';
        document.body.style.overflow = '';
    }
});

menuOverlay.addEventListener('click', () => {
    menuDesplegable.classList.remove('active');
    menuOverlay.classList.remove('active');
    menuIcon.src = '../img/assets/menu/menu.svg';
    menuIcon.alt = 'Menu Icon';
    document.body.style.overflow = '';
});