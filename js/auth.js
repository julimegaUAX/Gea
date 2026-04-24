document.addEventListener('DOMContentLoaded', function () {
    const loginLink = document.querySelector('.menu .login-link');
    const menuContainer = document.querySelector('.menu');
    const cartLink = document.querySelector('.menu a[href$="cart.html"], .menu a[href*="/cart.html"]');
    const inHtmlFolder = window.location.pathname.includes('/html/');
    const loginPath = inHtmlFolder ? 'login.html' : 'html/login.html';
    const userRaw = localStorage.getItem('gea_user');
    const hasSession = !!userRaw;

    function getCartItemCount() {
        const cartKeys = ['carrito', 'cart', 'gea_cart'];

        for (const key of cartKeys) {
            const cartRaw = localStorage.getItem(key);
            if (!cartRaw) {
                continue;
            }

            try {
                const parsed = JSON.parse(cartRaw);

                if (Array.isArray(parsed)) {
                    return parsed.reduce((total, item) => {
                        const quantity = Number(item && item.cantidad);
                        if (Number.isFinite(quantity) && quantity > 0) {
                            return total + quantity;
                        }
                        return total + 1;
                    }, 0);
                }

                if (parsed && Array.isArray(parsed.items)) {
                    return parsed.items.reduce((total, item) => {
                        const quantity = Number(item && item.cantidad);
                        if (Number.isFinite(quantity) && quantity > 0) {
                            return total + quantity;
                        }
                        return total + 1;
                    }, 0);
                }

                if (parsed && typeof parsed === 'object') {
                    const values = Object.values(parsed);
                    if (values.length > 0) {
                        return values.reduce((total, item) => {
                            if (item && typeof item === 'object') {
                                const quantity = Number(item.cantidad ?? item.quantity ?? item.qty);
                                if (Number.isFinite(quantity) && quantity > 0) {
                                    return total + quantity;
                                }
                            }
                            return total + 1;
                        }, 0);
                    }
                }
            } catch (error) {
                continue;
            }
        }

        return 0;
    }

    function ensureCartBadge() {
        if (!cartLink) {
            return null;
        }

        cartLink.classList.add('cart-link');

        let badge = cartLink.querySelector('#cart-count, .cart-count-badge');
        if (!badge) {
            badge = document.createElement('span');
            badge.id = 'cart-count';
            badge.className = 'cart-count-badge';
            cartLink.appendChild(badge);
        } else {
            badge.id = 'cart-count';
            badge.classList.add('cart-count-badge');
        }

        return badge;
    }

    function syncCartBadge() {
        const badge = ensureCartBadge();
        if (!badge) {
            return;
        }

        const count = getCartItemCount();
        if (count > 0) {
            badge.textContent = String(count);
            badge.style.display = 'flex';
        } else {
            badge.textContent = '';
            badge.style.display = 'none';
        }
    }

    syncCartBadge();

    window.addEventListener('storage', function (event) {
        if (!event.key || ['carrito', 'cart', 'gea_cart'].includes(event.key)) {
            syncCartBadge();
        }
    });

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

    syncCartBadge();
});
