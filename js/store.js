async function cargarSemillas() {
    try {
        const response = await fetch('../data/semillas.json');
        const semillas = await response.json();
        const herbList = document.getElementById('herb-list');
        const vegList = document.getElementById('veg-list');
        
        semillas.forEach(semilla => {
            const productDiv = document.createElement('div');
            productDiv.className = 'product-card';
            
            productDiv.innerHTML = `
                <img src="../img/${semilla.tipo_planta}/${semilla.nombre.toLowerCase()}.png" alt="${semilla.nombre}" class="product-image">
                <h2 class="product-name">${semilla.nombre}</h2>
                <p class="product-price">${semilla.precio}€</p>
                <button class="add-to-cart-btn">Añadir al carrito</button>
            `;
            
            // Añadir al div correspondiente según el tipo de planta
            if (semilla.tipo_planta === 'herb') {
                herbList.appendChild(productDiv);
            } else if (semilla.tipo_planta === 'veg') {
                vegList.appendChild(productDiv);
            }
        });
    } catch (error) {
        console.error('Error al cargar las semillas:', error);
    }
}

document.addEventListener('DOMContentLoaded', cargarSemillas);
