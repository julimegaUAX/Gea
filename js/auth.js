document.addEventListener('DOMContentLoaded', function () {
    const loginLink = document.querySelector('.menu .login-link');
    const menuContainer = document.querySelector('.menu');
    const inHtmlFolder = window.location.pathname.includes('/html/');
    const loginPath = inHtmlFolder ? 'login.html' : 'html/login.html';
    const userRaw = localStorage.getItem('gea_user');
    const hasSession = !!userRaw;

    if (!loginLink || !menuContainer) {
        return;
    }

    if (!hasSession) {
        loginLink.style.display = 'inline-flex';
        return;
    }

    let userName = 'Usuario';
    try {
        const user = JSON.parse(userRaw);
        if (user && user.nombre) {
            userName = user.nombre;
        }
    } catch (error) {
        userName = 'Usuario';
    }

    const dropdown = document.createElement('div');
    dropdown.className = 'user-menu-dropdown';
    dropdown.innerHTML = `
        <div class="user-menu-name">${userName}</div>
        <button type="button" class="user-menu-logout">Cerrar sesion</button>
    `;
    menuContainer.appendChild(dropdown);

    loginLink.setAttribute('href', '#');
    loginLink.addEventListener('click', function (event) {
        event.preventDefault();
        dropdown.classList.toggle('active');
    });

    const dropdownLogoutBtn = dropdown.querySelector('.user-menu-logout');
    dropdownLogoutBtn.addEventListener('click', function () {
        localStorage.removeItem('gea_user');
        window.location.href = loginPath;
    });

    document.addEventListener('click', function (event) {
        const clickedInsideMenu = menuContainer.contains(event.target);
        if (!clickedInsideMenu) {
            dropdown.classList.remove('active');
        }
    });

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
            dropdown.classList.remove('active');
        }
    });
});
