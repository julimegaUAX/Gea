async function cargarSemillas() {
    try {
        const response = await fetch('../data/semillas.json');
        const semillas = await response.json();
        const herbList = document.getElementById('herb-list');
        const vegList = document.getElementById('veg-list');
        const legList = document.getElementById('leg-list');
        const cerList = document.getElementById('cer-list');
        const floresList = document.getElementById('flo-list');
        const frutasList = document.getElementById('fru-list');
        
        semillas.forEach(semilla => {
            const productDiv = document.createElement('div');
            productDiv.className = 'product-card';
            
            // Normalizar el nombre para la ruta de la imagen (sin tildes, en minúsculas, espacios -> _)
            const nombreImagen = semilla.nombre
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/\s+/g, '_');
            
            productDiv.innerHTML = `
                <img src="../img/${semilla.tipo_planta}/${nombreImagen}.png" alt="${semilla.nombre}" class="product-image">
                <h2 class="product-name">${semilla.nombre}</h2>
                <p class="product-price">${semilla.precio}€</p>
                <button class="add-to-cart-btn" 
                        data-id="${semilla.id}" 
                        data-nombre="${semilla.nombre}" 
                        data-precio="${semilla.precio}"
                        data-tipo="${semilla.tipo_planta}">
                    Añadir al carrito
                </button>
            `;
            
            // Añadir al div correspondiente según el tipo de planta
            if (semilla.tipo_planta === 'herb') {
                herbList.appendChild(productDiv);
            } else if (semilla.tipo_planta === 'veg') {
                vegList.appendChild(productDiv);
            } else if (semilla.tipo_planta === 'leg') {
                legList.appendChild(productDiv);
            } else if (semilla.tipo_planta === 'cer') {
                cerList.appendChild(productDiv);
            } else if (semilla.tipo_planta === 'flo') {
                floresList.appendChild(productDiv);
            } else if (semilla.tipo_planta === 'fru') {
                frutasList.appendChild(productDiv);
            }
        });

        // Agregar event listeners a los botones después de crear los elementos
        document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                const nombre = this.getAttribute('data-nombre');
                const precio = parseFloat(this.getAttribute('data-precio'));
                const tipo_planta = this.getAttribute('data-tipo');
                addToCart({ id, nombre, precio, tipo_planta });
            });
        });

    } catch (error) {
        console.error('Error al cargar las semillas:', error);
    }
}

// Carrito - Gestionar con localStorage
function getCart() {
    const cart = localStorage.getItem('carrito');
    return cart ? JSON.parse(cart) : [];
}

function saveCart(cart) {
    localStorage.setItem('carrito', JSON.stringify(cart));
}

function addToCart(product) {
    let cart = getCart();
    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
        existingItem.cantidad++;
    } else {
        cart.push({
            id: product.id,
            nombre: product.nombre,
            precio: product.precio,
            cantidad: 1,
            tipo_planta: product.tipo_planta
        });
    }

    saveCart(cart);
    showNotification(`${product.nombre} añadido al carrito`);
    updateCartCount();
    updateCartFooter();
}

function updateCartCount() {
    const cart = getCart();
    const totalItems = cart.reduce((sum, item) => sum + item.cantidad, 0);
    const cartCountEl = document.getElementById('cart-count');
    if (cartCountEl) {
        cartCountEl.textContent = totalItems;
        cartCountEl.style.display = totalItems > 0 ? 'inline-block' : 'none';
    }
}

// Función para mostrar notificaciones
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// Función para actualizar el footer del carrito
function updateCartFooter() {
    const cart = getCart();
    const footerEl = document.getElementById('cart-footer');
    
    if (!footerEl) return;
    
    // Si el carrito está vacío, ocultar footer
    if (cart.length === 0) {
        footerEl.classList.remove('active');
        return;
    }
    
    // Mostrar footer
    footerEl.classList.add('active');
    
    // Contar items por categoría
    const categoryCounts = {
        herb: 0,
        veg: 0,
        leg: 0,
        cer: 0,
        flo: 0,
        fru: 0
    };
    
    let totalPrice = 0;
    
    cart.forEach(item => {
        if (item.tipo_planta && categoryCounts.hasOwnProperty(item.tipo_planta)) {
            categoryCounts[item.tipo_planta] += item.cantidad;
        }
        totalPrice += item.precio * item.cantidad;
    });
    
    // Actualizar cada categoría en el DOM
    Object.keys(categoryCounts).forEach(category => {
        const categoryEl = document.querySelector(`.category-count[data-category="${category}"]`);
        if (categoryEl) {
            const countEl = categoryEl.querySelector('.count');
            const count = categoryCounts[category];
            
            countEl.textContent = count;
            
            if (count > 0) {
                categoryEl.classList.add('has-items');
            } else {
                categoryEl.classList.remove('has-items');
            }
        }
    });
    
    // Actualizar total
    const totalPriceEl = document.getElementById('cart-total-price');
    if (totalPriceEl) {
        totalPriceEl.textContent = totalPrice.toFixed(2);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    cargarSemillas();
    updateCartCount();
    updateCartFooter();
    
    // Añadir evento al botón "Continuar" del carrito
    const viewCartBtn = document.querySelector('.view-cart-btn');
    if (viewCartBtn) {
        viewCartBtn.addEventListener('click', function() {
            window.location.href = 'cart.html';
        });
    }
});
