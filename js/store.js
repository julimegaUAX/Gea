async function cargarSemillas() {
    try {
        const response = await fetch('../data/semillas.json');
        const semillas = await response.json();
        const herbList = document.getElementById('herb-list');
        const vegList = document.getElementById('veg-list');
        const legList = document.getElementById('leg-list');
        const cerList = document.getElementById('cer-list');
        const floresList = document.getElementById('flores-list');
        const frutasList = document.getElementById('frutas-list');
        
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
                <button class="add-to-cart-btn" data-id="${semilla.id}" data-nombre="${semilla.nombre}" data-precio="${semilla.precio}">Añadir al carrito</button>
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
            } else if (semilla.tipo_planta === 'flores') {
                floresList.appendChild(productDiv);
            } else if (semilla.tipo_planta === 'frutas') {
                frutasList.appendChild(productDiv);
            }
        });

        // Agregar event listeners a los botones después de crear los elementos
        document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                const nombre = this.getAttribute('data-nombre');
                const precio = parseFloat(this.getAttribute('data-precio'));
                addToCart({ id, nombre, precio });
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
            cantidad: 1
        });
    }

    saveCart(cart);
    alert(`${product.nombre} añadido al carrito`);
    updateCartCount();
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

document.addEventListener('DOMContentLoaded', function() {
    cargarSemillas();
    updateCartCount();
});
