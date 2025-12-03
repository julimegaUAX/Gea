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
            <button class="add-to-cart-btn">Añadir al carrito</button>
        `;            // Añadir al div correspondiente según el tipo de planta
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
    } catch (error) {
        console.error('Error al cargar las semillas:', error);
    }
}

document.addEventListener('DOMContentLoaded', cargarSemillas);
