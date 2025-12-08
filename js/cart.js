// Cargar carrito desde localStorage
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
                    <input type="number" class="qty-input" value="${item.cantidad}" data-index="${index}" min="1">
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
    let subtotal = 0;

    cart.forEach(item => {
        subtotal += item.precio * item.cantidad;
    });

    const total = subtotal; // Sin costos de envío

    document.getElementById('subtotal').textContent = subtotal.toFixed(2) + '€';
    document.getElementById('total').textContent = total.toFixed(2) + '€';
}

// Checkout
document.querySelector('.btn-checkout').addEventListener('click', function() {
    const cart = getCart();
    if (cart.length === 0) {
        alert('El carrito está vacío');
        return;
    }
    
    alert('¡Pago realizado! Gracias por tu compra.');
    saveCart([]);
    renderCart();
});

document.addEventListener('DOMContentLoaded', renderCart);

// Menú desplegable
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

document.getElementById('close-icon').addEventListener('click', function() {
    const menu = document.querySelector('.menu-desplegable');
    const overlay = document.getElementById('menu-overlay');
    const menuIcon = document.getElementById('menu-icon');
    const closeIcon = document.getElementById('close-icon');
    
    menu.classList.remove('active');
    overlay.classList.remove('active');
    menuIcon.style.display = 'block';
    closeIcon.style.display = 'none';
    document.body.style.overflow = 'auto';
});

// Cerrar menú al hacer click en el overlay
document.getElementById('menu-overlay').addEventListener('click', function() {
    const menu = document.querySelector('.menu-desplegable');
    const overlay = document.getElementById('menu-overlay');
    const menuIcon = document.getElementById('menu-icon');
    const closeIcon = document.getElementById('close-icon');
    
    menu.classList.remove('active');
    overlay.classList.remove('active');
    menuIcon.style.display = 'block';
    closeIcon.style.display = 'none';
    document.body.style.overflow = 'auto';
});
