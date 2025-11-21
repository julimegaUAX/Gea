// Cargar y mostrar las semillas
async function cargarSemillas() {
    try {
        const response = await fetch('../data/semillas.json');
        const semillas = await response.json();
        
        const productList = document.getElementById('product-list');
        
        semillas.forEach(semilla => {
            // Crear el div para cada semilla
            const productDiv = document.createElement('div');
            productDiv.className = 'product-card';
            
            // Construir el HTML de la tarjeta
            productDiv.innerHTML = `
                <img src="../${semilla.imagen}" alt="${semilla.nombre}" class="product-image">
                <h2 class="product-name">${semilla.nombre}</h2>
                <p class="product-season">Estación: ${semilla.estacion}</p>
                <p class="product-price">${semilla.precio}</p>
                <p class="product-difficulty">Dificultad: ${semilla.dificultad}</p>
                <div class="product-properties">
                    <strong>Propiedades:</strong>
                    <ul>
                        ${semilla.propiedades.map(prop => `<li>${prop}</li>`).join('')}
                    </ul>
                </div>
                <button class="add-to-cart-btn">Añadir al carrito</button>
            `;
            
            productList.appendChild(productDiv);
        });
    } catch (error) {
        console.error('Error al cargar las semillas:', error);
    }
}

// Ejecutar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', cargarSemillas);
