async function cargarSemillas() {
    try {
        const response = await fetch('../data/semillas.json');
        const semillas = await response.json();
        const herbList = document.getElementById('herb-list');
        const vegList = document.getElementById('veg-list');
        const legList = document.getElementById('leg-list');
        const cerList = document.getElementById('cer-list');
        const floList = document.getElementById('flo-list');
        const fruList = document.getElementById('fru-list');
        
        semillas.forEach(semilla => {
            const productDiv = document.createElement('div');
            productDiv.className = 'product-card';
            productDiv.setAttribute('data-type', semilla.tipo_planta);
            
            // Normalizar el nombre para la ruta de la imagen (sin tildes, en minúsculas, espacios -> _)
            const nombreImagen = semilla.nombre
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/\s+/g, '_');
            
            productDiv.innerHTML = `
                <img src="../img/${semilla.tipo_planta}/${nombreImagen}.png" alt="${semilla.nombre}" class="product-image">
                <h2 class="product-name">${semilla.nombre}</h2>
                <div class="product-properties">
                    <div class="property-item" title="Luz: ${semilla.necesidad_luz}">
                        <img src="../img/properties/luz/${semilla.necesidad_luz}.png" alt="${semilla.necesidad_luz}">
                    </div>
                    <div class="property-item" title="Riego: ${semilla.riego}">
                        <img src="../img/properties/riego/${semilla.riego}.png" alt="${semilla.riego}">
                    </div>
                    <div class="property-item" title="Resistencia al frío: ${semilla.resistencia_frio}">
                        <img src="../img/properties/resistencia_frio/${semilla.resistencia_frio}.png" alt="${semilla.resistencia_frio}">
                    </div>
                    <div class="property-item" title="Estación de siembra: ${semilla.estacion_siembra}">
                        <img src="../img/properties/estacion_siembra/${semilla.estacion_siembra}.png" alt="${semilla.estacion_siembra}">
                    </div>
                    ${semilla.invernadero ? '<div class="property-item" title="Requiere invernadero"><img src="../img/properties/extras/invernadero.png" alt="Invernadero"></div>' : ''}
                </div>
                <p class="product-price">${semilla.precio}€</p>
                <button class="add-to-cart-btn" 
                        data-id="${semilla.id}" 
                        data-nombre="${semilla.nombre}" 
                        data-precio="${semilla.precio}"
                        data-tipo="${semilla.tipo_planta}">
                    Añadir al carrito
                </button>
                <div class="quantity-controls" style="display: none;" data-id="${semilla.id}">
                    <button class="quantity-btn minus-btn" data-id="${semilla.id}">-</button>
                    <span class="quantity-display">0</span>
                    <button class="quantity-btn plus-btn" data-id="${semilla.id}">+</button>
                </div>
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
                floList.appendChild(productDiv);
            } else if (semilla.tipo_planta === 'fru') {
                fruList.appendChild(productDiv);
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

        // Event listeners para botones de cantidad
        document.querySelectorAll('.plus-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                const productCard = this.closest('.product-card');
                const nombre = productCard.querySelector('.add-to-cart-btn').getAttribute('data-nombre');
                const precio = parseFloat(productCard.querySelector('.add-to-cart-btn').getAttribute('data-precio'));
                const tipo_planta = productCard.querySelector('.add-to-cart-btn').getAttribute('data-tipo');
                addToCart({ id, nombre, precio, tipo_planta });
            });
        });

        document.querySelectorAll('.minus-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                removeFromCart(id);
            });
        });

        // Actualizar UI para productos ya en el carrito
        updateProductUI();

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
    updateProductUI();
}

function removeFromCart(productId) {
    let cart = getCart();
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.cantidad--;
        if (existingItem.cantidad <= 0) {
            cart = cart.filter(item => item.id !== productId);
            showNotification(`Producto eliminado del carrito`);
        } else {
            showNotification(`Cantidad actualizada`);
        }
    }

    saveCart(cart);
    updateCartCount();
    updateCartFooter();
    updateProductUI();
}

function updateProductUI() {
    const cart = getCart();
    
    // Recorrer todos los productos
    document.querySelectorAll('.product-card').forEach(card => {
        const addBtn = card.querySelector('.add-to-cart-btn');
        const quantityControls = card.querySelector('.quantity-controls');
        const productId = addBtn.getAttribute('data-id');
        
        const cartItem = cart.find(item => item.id === productId);
        
        if (cartItem && cartItem.cantidad > 0) {
            // Producto está en el carrito - mostrar controles
            addBtn.style.display = 'none';
            quantityControls.style.display = 'flex';
            quantityControls.querySelector('.quantity-display').textContent = cartItem.cantidad;
        } else {
            // Producto no está en el carrito - mostrar botón añadir
            addBtn.style.display = 'block';
            quantityControls.style.display = 'none';
        }
    });
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

    // Filtrador de productos
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const filterValue = this.getAttribute('data-filter');
            
            // Actualizar botón activo
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Filtrar productos y títulos
            const categoryNames = document.querySelectorAll('.store-name');
            const productLists = document.querySelectorAll('.product-list');
            const productCards = document.querySelectorAll('.product-card');
            
            categoryNames.forEach((name, index) => {
                const category = name.getAttribute('data-category');
                const list = productLists[index];
                
                if (filterValue === 'all') {
                    name.classList.remove('hidden');
                    list.classList.remove('hidden');
                } else {
                    if (category === filterValue) {
                        name.classList.remove('hidden');
                        list.classList.remove('hidden');
                    } else {
                        name.classList.add('hidden');
                        list.classList.add('hidden');
                    }
                }
            });
            
            productCards.forEach(card => {
                if (filterValue === 'all') {
                    card.style.display = 'block';
                } else {
                    const productType = card.getAttribute('data-type');
                    card.style.display = productType === filterValue ? 'block' : 'none';
                }
            });
        });
    });
});

// Agregar evento al botón de continuar
const viewCartBtn = document.querySelector('.view-cart-btn');
if (viewCartBtn) {
    viewCartBtn.addEventListener('click', function() {
        window.location.href = 'cart.html';
    });
}

document.getElementById('menu-icon').addEventListener('click', function() {
    const menu = document.querySelector('.menu-desplegable');
    const menuIcon = document.getElementById('menu-icon');
    const closeIcon = document.getElementById('close-icon');
    
    menu.classList.add('active');
    menuIcon.style.display = 'none';
    closeIcon.style.display = 'block';
});

document.getElementById('close-icon').addEventListener('click', function() {
    const menu = document.querySelector('.menu-desplegable');
    const menuIcon = document.getElementById('menu-icon');
    const closeIcon = document.getElementById('close-icon');
    
    menu.classList.remove('active');
    menuIcon.style.display = 'block';
    closeIcon.style.display = 'none';
});
