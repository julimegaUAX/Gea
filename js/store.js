// === Catálogo de propiedades dinámico ===
const propiedadesConfig = [
    {
        clase: 'luz-propiedad',
        titulo: 'Luz deseada para la planta',
        niveles: [
            { nombre: 'Sol', icono: '../img/properties/luz/sol.png' },
            { nombre: 'Semisombra', icono: '../img/properties/luz/semisombra.png' },
            { nombre: 'Sombra', icono: '../img/properties/luz/sombra.png' }
        ]
    },
    {
        clase: 'agua-propiedad',
        titulo: 'Frecuencia de riego recomendada',
        niveles: [
            { nombre: 'Bajo', icono: '../img/properties/riego/bajo.png' },
            { nombre: 'Medio', icono: '../img/properties/riego/medio.png' },
            { nombre: 'Alto', icono: '../img/properties/riego/alto.png' }
        ]
    },
    {
        clase: 'resistencia_frio-propiedad',
        titulo: 'Resistencia al frío de la planta',
        niveles: [
            { nombre: 'Baja', icono: '../img/properties/resistencia_frio/baja.png' },
            { nombre: 'Media', icono: '../img/properties/resistencia_frio/media.png' },
            { nombre: 'Alta', icono: '../img/properties/resistencia_frio/alta.png' }
        ]
    },
    {
        clase: 'estacion_siembra-propiedad',
        titulo: 'Estación recomendada para la siembra',
        niveles: [
            { nombre: 'Primavera', icono: '../img/properties/estacion_siembra/primavera.png' },
            { nombre: 'Verano', icono: '../img/properties/estacion_siembra/verano.png' },
            { nombre: 'Otoño', icono: '../img/properties/estacion_siembra/otoño.png' },
            { nombre: 'Invierno', icono: '../img/properties/estacion_siembra/invierno.png' }
        ]
    },
    {
        clase: 'dificultad-propiedad',
        titulo: 'Dificultad de cultivo',
        niveles: [
            { nombre: 'Fácil', icono: '../img/properties/dificultad/facil.png' },
            { nombre: 'Intermedio', icono: '../img/properties/dificultad/intermedio.png' },
            { nombre: 'Avanzado', icono: '../img/properties/dificultad/avanzado.png' }
        ]
    },
    {
        clase: 'cuidados-propiedad',
        titulo: 'Nivel de cuidados necesarios',
        niveles: [
            { nombre: 'Bajo', icono: '../img/properties/cuidados/bajo.png' },
            { nombre: 'Medio', icono: '../img/properties/cuidados/medio.png' },
            { nombre: 'Alto', icono: '../img/properties/cuidados/alto.png' }
        ]
    },
    {
        clase: 'produccion-propiedad',
        titulo: 'Nivel de producción esperado',
        niveles: [
            { nombre: 'Baja', icono: '../img/properties/produccion/baja.png' },
            { nombre: 'Media', icono: '../img/properties/produccion/media.png' },
            { nombre: 'Alta', icono: '../img/properties/produccion/alta.png' }
        ]
    },
    {
        clase: 'extras-propiedad',
        titulo: 'Características adicionales',
        niveles: [
            { nombre: 'Invernadero', icono: '../img/properties/extras/invernadero.png' }
        ]
    }
];

function generarCatalogoPropiedades() {
    const container = document.getElementById('propiedades-container');
    container.innerHTML = propiedadesConfig.map(propiedad => `
        <div class="${propiedad.clase}">
            ${propiedad.niveles.map(nivel => 
                `<img src="${nivel.icono}" alt="Icono ${nivel.nombre}" class="propiedad-icon">`
            ).join('')}
            <p>${propiedad.titulo}</p>
        </div>
    `).join('');
}

// === Cargar semillas y generar catálogo de productos ===
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
            
            const nombreImagen = semilla.nombre
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/\s+/g, '_');
            
            productDiv.innerHTML = `
                <img src="../img/${semilla.tipo_planta}/${nombreImagen}.png" alt="${semilla.nombre}" class="product-image">
                <h2 class="product-name">${semilla.nombre}</h2>
                <div class="product-properties">
                    <div class="property-item">
                        <img src="../img/properties/luz/${semilla.necesidad_luz}.png" alt="${semilla.necesidad_luz}">
                    </div>
                    <div class="property-item">
                        <img src="../img/properties/riego/${semilla.riego}.png" alt="${semilla.riego}">
                    </div>
                    <div class="property-item">
                        <img src="../img/properties/resistencia_frio/${semilla.resistencia_frio}.png" alt="${semilla.resistencia_frio}">
                    </div>
                    <div class="property-item">
                        <img src="../img/properties/estacion_siembra/${semilla.estacion_siembra}.png" alt="${semilla.estacion_siembra}">
                    </div>
                    <div class="property-item">
                        <img src="../img/properties/dificultad/${semilla.dificultad}.png" alt="${semilla.dificultad}">
                    </div>
                    <div class="property-item">
                        <img src="../img/properties/cuidados/${semilla.cuidados}.png" alt="${semilla.cuidados}">
                    </div>
                    <div class="property-item">
                        <img src="../img/properties/produccion/${semilla.produccion}.png" alt="${semilla.produccion}">
                    </div>
                    ${semilla.invernadero ? '<div class="property-item"><img src="../img/properties/extras/invernadero.png" alt="Invernadero"></div>' : ''}
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

        document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                const nombre = this.getAttribute('data-nombre');
                const precio = parseFloat(this.getAttribute('data-precio'));
                const tipo_planta = this.getAttribute('data-tipo');
                addToCart({ id, nombre, precio, tipo_planta });
            });
        });

        document.querySelectorAll('.plus-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                incrementQuantity(id);
            });
        });

        document.querySelectorAll('.minus-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                removeFromCart(id);
            });
        });

        updateProductUI();

    } catch (error) {
        console.error('Error al cargar las semillas:', error);
    }
}

// === Carrito de compras ===
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
    updateCartCount();
    updateCartFooter();
    updateProductUI();
}

function incrementQuantity(productId) {
    let cart = getCart();
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.cantidad++;
        saveCart(cart);
        updateCartCount();
        updateCartFooter();
        updateProductUI();
    }
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
    
    document.querySelectorAll('.product-card').forEach(card => {
        const addBtn = card.querySelector('.add-to-cart-btn');
        const quantityControls = card.querySelector('.quantity-controls');
        const productId = addBtn.getAttribute('data-id');
        
        const cartItem = cart.find(item => item.id === productId);
        
        if (cartItem && cartItem.cantidad > 0) {
            addBtn.style.display = 'none';
            quantityControls.style.display = 'flex';
            quantityControls.querySelector('.quantity-display').textContent = cartItem.cantidad;
        } else {
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

// === Actualizar footer del carrito ===
function updateCartFooter() {
    const cart = getCart();
    const footerEl = document.getElementById('cart-footer');
    
    if (!footerEl) return;
    
    if (cart.length === 0) {
        footerEl.classList.remove('active');
        return;
    }

    footerEl.classList.add('active');
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
    
    const totalPriceEl = document.getElementById('cart-total-price');
    if (totalPriceEl) {
        totalPriceEl.textContent = totalPrice.toFixed(2);
    }
}
// === Activacion de funciones una vez cargada la página ===
document.addEventListener('DOMContentLoaded', function() {
    generarCatalogoPropiedades();
    cargarSemillas();
    updateCartCount();
    updateCartFooter();
});

// === Menu desplegable ===
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

// == Cerrar menu desplegable ==
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
