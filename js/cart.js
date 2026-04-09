// Cargar carrito desde localStorage
const API_BASE_URL = 'http://127.0.0.1:5000/api';

function getCart() {
    const cart = localStorage.getItem('carrito');
    return cart ? JSON.parse(cart) : [];
}

function saveCart(cart) {
    localStorage.setItem('carrito', JSON.stringify(cart));
}

function renderCart() {
    const cart = getCart();
    const cartItemsContainer = document.getElementById('cart-items');
    const emptyCartMsg = document.getElementById('empty-cart');
    const cartContainer = document.getElementById('cart-container');

    if (cart.length === 0) {
        cartContainer.style.display = 'none';
        emptyCartMsg.style.display = 'block';
        document.querySelector('.cart-summary').style.display = 'none';
        return;
    }

    cartContainer.style.display = 'block';
    emptyCartMsg.style.display = 'none';
    document.querySelector('.cart-summary').style.display = 'block';

    cartItemsContainer.innerHTML = '';

    cart.forEach((item, index) => {
        const subtotal = (item.precio * item.cantidad).toFixed(2);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.nombre}</td>
            <td>${item.precio.toFixed(2)}€</td>
            <td>
                <div class="quantity-control">
                    <button class="qty-btn" data-index="${index}" data-action="decrease">-</button>
                    <input type="number" class="qty-input" value="${item.cantidad}" data-index="${index}" data-product-id="${item.id}" min="1">
                    <button class="qty-btn" data-index="${index}" data-action="increase">+</button>
                </div>
            </td>
            <td>${subtotal}€</td>
            <td>
                <button class="btn-remove" data-index="${index}">Eliminar</button>
            </td>
        `;
        cartItemsContainer.appendChild(row);
    });

    // Event listeners para cantidad
    document.querySelectorAll('.qty-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = this.getAttribute('data-index');
            const action = this.getAttribute('data-action');
            updateQuantity(index, action);
        });
    });

    document.querySelectorAll('.qty-input').forEach(input => {
        input.addEventListener('change', function() {
            const index = this.getAttribute('data-index');
            const newQty = parseInt(this.value);
            if (newQty > 0) {
                updateQuantityDirect(index, newQty);
            }
        });
    });

    // Event listeners para eliminar
    document.querySelectorAll('.btn-remove').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = this.getAttribute('data-index');
            removeFromCart(index);
        });
    });

    calculateTotals();
}

function updateQuantity(index, action) {
    let cart = getCart();
    if (action === 'increase') {
        cart[index].cantidad++;
    } else if (action === 'decrease' && cart[index].cantidad > 1) {
        cart[index].cantidad--;
    }
    saveCart(cart);
    renderCart();
}

function updateQuantityDirect(index, newQty) {
    let cart = getCart();
    cart[index].cantidad = newQty;
    saveCart(cart);
    renderCart();
}

function removeFromCart(index) {
    let cart = getCart();
    cart.splice(index, 1);
    saveCart(cart);
    renderCart();
}

function calculateTotals() {
    const cart = getCart();
    const total = getCartTotal(cart); // Sin costos de envío

    document.getElementById('subtotal').textContent = total.toFixed(2) + '€';
    document.getElementById('total').textContent = total.toFixed(2) + '€';
}

function getCartTotal(cart) {
    return cart.reduce((sum, item) => sum + (Number(item.precio) * Number(item.cantidad)), 0);
}

function syncCartQuantitiesFromDOM() {
    const cart = getCart();
    const inputs = document.querySelectorAll('.qty-input');

    inputs.forEach(input => {
        const productId = input.getAttribute('data-product-id');
        const quantity = parseInt(input.value, 10);

        if (!productId || !Number.isFinite(quantity) || quantity <= 0) {
            return;
        }

        const cartItem = cart.find(item => item.id === productId);
        if (cartItem) {
            cartItem.cantidad = quantity;
        }
    });

    saveCart(cart);
    return cart;
}

// Checkout
document.querySelector('.btn-checkout').addEventListener('click', async function() {
    const cart = getCart();
    if (cart.length === 0) {
        alert('El carrito está vacío');
        return;
    }

    const userRaw = localStorage.getItem('gea_user');
    if (!userRaw) {
        alert('Debes iniciar sesion para finalizar la compra');
        window.location.href = 'login.html';
        return;
    }

    let user;
    try {
        user = JSON.parse(userRaw);
    } catch (error) {
        alert('Sesion invalida. Vuelve a iniciar sesion.');
        localStorage.removeItem('gea_user');
        window.location.href = 'login.html';
        return;
    }

    const idUser = Number(user.id_user ?? user.id);
    if (!Number.isFinite(idUser) || idUser <= 0) {
        alert('Sesion invalida. Vuelve a iniciar sesion.');
        localStorage.removeItem('gea_user');
        window.location.href = 'login.html';
        return;
    }

    try {
        const syncedCart = syncCartQuantitiesFromDOM();
        const lineas = syncedCart
            .map(item => ({
                id_prod: Number(item.id),
                cant: Number(item.cantidad),
                precio_unitario: Number(item.precio),
            }))
            .filter(
                linea =>
                    Number.isFinite(linea.id_prod) &&
                    linea.id_prod > 0 &&
                    Number.isFinite(linea.cant) &&
                    linea.cant > 0 &&
                    Number.isFinite(linea.precio_unitario) &&
                    linea.precio_unitario > 0
            );

        if (lineas.length === 0) {
            alert('No hay lineas validas en el carrito');
            return;
        }

        const totalPedido = Number(getCartTotal(syncedCart).toFixed(2));

        const response = await fetch(`${API_BASE_URL}/checkout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id_user: idUser,
                lineas: lineas,
                total_pedido: totalPedido
            })
        });

        const result = await response.json();
        if (!response.ok || !result.ok) {
            throw new Error(result.message || 'No se pudo guardar el pedido');
        }

        alert(`Pedido #${result.id_pedido} guardado. Total: ${result.total}€`);
        saveCart([]);
        renderCart();
    } catch (error) {
        alert(error.message);
    }
});

document.addEventListener('DOMContentLoaded', renderCart);

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
