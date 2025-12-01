async function cargarSemillas() {
    try {
        const response = await fetch('../data/semillas.json');
        const semillas = await response.json();
        const productList = document.getElementById('product-list');
        
        semillas.forEach(semilla => {
            const productDiv = document.createElement('div');
            productDiv.className = 'product-card';
            
            productDiv.innerHTML = `
                <img src="../img/herb/${semilla.nombre.toLowerCase()}.png" alt="${semilla.nombre}" class="product-image">
                <h2 class="product-name">${semilla.nombre}</h2>
                <p class="product-price">${semilla.precio}</p>
                <button class="add-to-cart-btn">Añadir al carrito</button>
            `;
            
            productList.appendChild(productDiv);
        });
    } catch (error) {
        console.error('Error al cargar las semillas:', error);
    }
}

document.addEventListener('DOMContentLoaded', cargarSemillas);
