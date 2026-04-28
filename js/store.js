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

const API_BASE_URL = 'http://127.0.0.1:5001/GEA';
let semillasCatalogo = [];

function getCurrentUser() {
    const raw = localStorage.getItem('gea_user');
    if (!raw) return null;

    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

function isAdminUser() {
    const user = getCurrentUser();
    return user?.role === 'admin';
}

async function updateStockAsAdmin(idProd, stock) {
    const user = getCurrentUser();
    const idUser = Number(user?.id_user ?? user?.id);

    if (!Number.isFinite(idUser) || idUser <= 0) {
        throw new Error('Sesion invalida para actualizar stock');
    }

    const response = await fetch(`${API_BASE_URL}/admin/productos/${idProd}/stock`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id_user: idUser,
            stock: Boolean(stock)
        })
    });

    const result = await response.json();
    if (!response.ok || !result.ok) {
        throw new Error(result.message || 'No se pudo actualizar el stock');
    }

    return result;
}

async function updatePriceAsAdmin(idProd, accion, monto) {
    const user = getCurrentUser();
    const idUser = Number(user?.id_user ?? user?.id);

    if (!Number.isFinite(idUser) || idUser <= 0) {
        throw new Error('Sesion invalida para actualizar precio');
    }

    const response = await fetch(`${API_BASE_URL}/admin/productos/${idProd}/precio`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id_user: idUser,
            accion,
            monto
        })
    });

    const result = await response.json();
    if (!response.ok || !result.ok) {
        throw new Error(result.message || 'No se pudo actualizar el precio');
    }

    return result;
}

async function createSeedAsAdmin(seedPayload) {
    const user = getCurrentUser();
    const idUser = Number(user?.id_user ?? user?.id);

    if (!Number.isFinite(idUser) || idUser <= 0) {
        throw new Error('Sesion invalida para crear semilla');
    }

    const response = await fetch(`${API_BASE_URL}/admin/productos`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id_user: idUser,
            ...seedPayload
        })
    });

    const result = await response.json();
    if (!response.ok || !result.ok) {
        throw new Error(result.message || 'No se pudo crear la semilla');
    }

    return result;
}

async function deleteSeedAsAdmin(seedName) {
    const user = getCurrentUser();
    const idUser = Number(user?.id_user ?? user?.id);
    const normalizedName = String(seedName || '').trim();

    if (!Number.isFinite(idUser) || idUser <= 0) {
        throw new Error('Sesion invalida para eliminar semilla');
    }

    if (!normalizedName) {
        throw new Error('Debes indicar el nombre de la semilla');
    }

    const response = await fetch(`${API_BASE_URL}/admin/productos`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id_user: idUser,
            nombre: normalizedName
        })
    });

    const result = await response.json();
    if (!response.ok || !result.ok) {
        throw new Error(result.message || 'No se pudo eliminar la semilla');
    }

    return result;
}

const categoryContainers = {
    herb: document.getElementById('herb-list'),
    veg: document.getElementById('veg-list'),
    leg: document.getElementById('leg-list'),
    cer: document.getElementById('cer-list'),
    flo: document.getElementById('flo-list'),
    fru: document.getElementById('fru-list')
};

const filterConfig = [
    { id: 'filter-tipo', key: 'tipo_planta', label: 'Todos los tipos' },
    { id: 'filter-luz', key: 'necesidad_luz', label: 'Toda la luz' },
    { id: 'filter-riego', key: 'riego', label: 'Todo el riego' },
    { id: 'filter-resistencia', key: 'resistencia_frio', label: 'Toda la resistencia al frio' },
    { id: 'filter-estacion', key: 'estacion_siembra', label: 'Todas las estaciones' },
    { id: 'filter-dificultad', key: 'dificultad', label: 'Todas las dificultades' },
    { id: 'filter-cuidados', key: 'cuidados', label: 'Todos los cuidados' },
    { id: 'filter-produccion', key: 'produccion', label: 'Toda la produccion' },
    { id: 'filter-tiempo', key: 'tiempo_cosecha', label: 'Todos los tiempos de cosecha' }
];

const FILTER_OPTION_PRESETS = {
    tipo_planta: [
        { value: 'herb', label: 'Hierbas aromaticas' },
        { value: 'veg', label: 'Vegetales' },
        { value: 'leg', label: 'Legumbres' },
        { value: 'cer', label: 'Cereales' },
        { value: 'flo', label: 'Flores' },
        { value: 'fru', label: 'Frutas' }
    ],
    necesidad_luz: ['sol', 'semisombra', 'sombra'],
    riego: ['bajo', 'medio', 'alto'],
    resistencia_frio: ['baja', 'media', 'alta'],
    estacion_siembra: ['primavera', 'verano', 'otoño', 'invierno'],
    dificultad: ['facil', 'intermedio', 'avanzado'],
    cuidados: ['bajo', 'medio', 'alto'],
    produccion: ['baja', 'media', 'alta']
};

function normalizeText(value) {
    return String(value || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

function toTitleCase(value) {
    const normalized = String(value || '').replace(/_/g, ' ');
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function formatFilterValue(value) {
    if (typeof value === 'boolean') {
        return value ? 'Si' : 'No';
    }
    return toTitleCase(value);
}

function generarCatalogoPropiedades() {
    const container = document.getElementById('propiedades-container');
    if (!container) return;

    container.innerHTML = propiedadesConfig.map(propiedad => `
        <div class="${propiedad.clase}">
            ${propiedad.niveles.map(nivel => `<img src="${nivel.icono}" alt="Icono ${nivel.nombre}" class="propiedad-icon">`).join('')}
            <p>${propiedad.titulo}</p>
        </div>
    `).join('');
}

function buildFilterOptions(semillas) {
    filterConfig.forEach(({ id, key, label }) => {
        const select = document.getElementById(id);
        if (!select) return;

        let optionsHtml = `<option value="">${label}</option>`;

        if (FILTER_OPTION_PRESETS[key]) {
            optionsHtml += FILTER_OPTION_PRESETS[key]
                .map(item => {
                    const value = typeof item === 'string' ? item : item.value;
                    const text = typeof item === 'string' ? toTitleCase(item) : item.label;
                    return `<option value="${value}">${text}</option>`;
                })
                .join('');
        } else {
            const values = [...new Set(semillas.map(semilla => semilla[key]).filter(Boolean))]
                .sort((a, b) => String(a).localeCompare(String(b), 'es'));

            optionsHtml += values
                .map(value => `<option value="${value}">${toTitleCase(value)}</option>`)
                .join('');
        }

        select.innerHTML = optionsHtml;
    });

    const invernaderoSelect = document.getElementById('filter-invernadero');
    if (invernaderoSelect) {
        invernaderoSelect.innerHTML = [
            '<option value="">Invernadero: todos</option>',
            '<option value="si">Solo invernadero</option>',
            '<option value="no">Sin invernadero</option>'
        ].join('');
    }

    const sortSelect = document.getElementById('filter-sort');
    if (sortSelect) {
        sortSelect.innerHTML = [
            '<option value="relevancia">Orden: relevancia</option>',
            '<option value="nombre-asc">Nombre A-Z</option>',
            '<option value="nombre-desc">Nombre Z-A</option>',
            '<option value="precio-asc">Precio menor a mayor</option>',
            '<option value="precio-desc">Precio mayor a menor</option>'
        ].join('');
    }
}

function updateAdminPriceProductNameOptions(semillas) {
    const dataLists = [
        document.getElementById('admin-price-product-names'),
        document.getElementById('admin-delete-seed-names')
    ].filter(Boolean);
    if (dataLists.length === 0) return;

    const names = [...new Set((semillas || []).map(item => String(item?.nombre || '').trim()).filter(Boolean))]
        .sort((a, b) => a.localeCompare(b, 'es'));

    const optionsHtml = names
        .map(name => `<option value="${name}"></option>`)
        .join('');

    dataLists.forEach(dataList => {
        dataList.innerHTML = optionsHtml;
    });
}

function initDefaultFilterOptions() {
    buildFilterOptions([]);
}

function getFilterState() {
    const searchInput = document.getElementById('filter-search');
    const minInput = document.getElementById('filter-precio-min');
    const maxInput = document.getElementById('filter-precio-max');

    const minRaw = (minInput?.value || '').trim();
    const maxRaw = (maxInput?.value || '').trim();

    let min = minRaw === '' ? null : Number(minRaw);
    let max = maxRaw === '' ? null : Number(maxRaw);

    min = Number.isFinite(min) ? min : null;
    max = Number.isFinite(max) ? max : null;

    if (min !== null && max !== null && min > max) {
        [min, max] = [max, min];
        if (minInput && maxInput) {
            minInput.value = min;
            maxInput.value = max;
        }
    }

    return {
        searchText: normalizeText(searchInput?.value),
        invernadero: document.getElementById('filter-invernadero')?.value || '',
        sort: document.getElementById('filter-sort')?.value || 'relevancia',
        minPrice: min,
        maxPrice: max,
        selected: filterConfig.reduce((acc, { id, key }) => {
            acc[key] = document.getElementById(id)?.value || '';
            return acc;
        }, {})
    };
}

function getApiFilterParams() {
    const state = getFilterState();
    const params = new URLSearchParams();

    if (state.searchText) {
        params.set('nombre', state.searchText);
    }

    Object.entries(state.selected).forEach(([key, value]) => {
        if (value) {
            params.set(key, value);
        }
    });

    if (state.invernadero) {
        params.set('invernadero', state.invernadero);
    }

    if (state.minPrice !== null) {
        params.set('precio_min', String(state.minPrice));
    }

    if (state.maxPrice !== null) {
        params.set('precio_max', String(state.maxPrice));
    }

    if (state.sort) {
        params.set('sort', state.sort);
    }

    return { state, params };
}

async function fetchSemillasFromApi(queryParams = new URLSearchParams()) {
    const query = queryParams.toString();
    const url = query ? `${API_BASE_URL}/semillas?${query}` : `${API_BASE_URL}/semillas`;
    const response = await fetch(url, { cache: 'no-store' });
    const result = await response.json();

    if (!response.ok || !result.ok) {
        throw new Error(result.message || 'No se pudo cargar el catálogo');
    }

    return result.semillas || [];
}

async function cargarSemillas() {
    try {
        semillasCatalogo = await fetchSemillasFromApi();
        buildFilterOptions(semillasCatalogo);
        updateAdminPriceProductNameOptions(semillasCatalogo);
        renderSemillas(semillasCatalogo);
        updateCartFooter();
    } catch (error) {
        console.warn('API no disponible, usando data/semillas.json como respaldo.', error);

        try {
            const fallbackResponse = await fetch('../data/semillas.json');
            const fallbackSemillas = await fallbackResponse.json();
            semillasCatalogo = Array.isArray(fallbackSemillas) ? fallbackSemillas : [];
            buildFilterOptions(semillasCatalogo);
            updateAdminPriceProductNameOptions(semillasCatalogo);
            renderSemillas(semillasCatalogo);
            updateCartFooter();
        } catch (fallbackError) {
            console.error('Error al cargar semillas desde respaldo local:', fallbackError);
            semillasCatalogo = [];
            buildFilterOptions([]);
            updateAdminPriceProductNameOptions([]);
            renderSemillas([]);
        }
    }
}

function buildProductCard(semilla) {
    const productDiv = document.createElement('div');
    const sinStock = semilla.stock === false;
    const isAdmin = isAdminUser();

    productDiv.className = sinStock ? 'product-card out-of-stock' : 'product-card';
    productDiv.setAttribute('data-type', semilla.tipo_planta);

    const nombreImagen = normalizeText(semilla.nombre).replace(/\s+/g, '_');

    productDiv.innerHTML = `
        ${sinStock ? '<div class="stock-label">Sin existencias</div>' : ''}
        <img src="../img/${semilla.tipo_planta}/${nombreImagen}.png" alt="${semilla.nombre}" class="product-image">
        <p class="product-image-fallback is-hidden">No Hay Imagen Disponible</p>
        <h2 class="product-name">${semilla.nombre}</h2>
        <div class="product-properties">
            <div class="property-item"><img src="../img/properties/luz/${semilla.necesidad_luz}.png" alt="${semilla.necesidad_luz}"></div>
            <div class="property-item"><img src="../img/properties/riego/${semilla.riego}.png" alt="${semilla.riego}"></div>
            <div class="property-item"><img src="../img/properties/resistencia_frio/${semilla.resistencia_frio}.png" alt="${semilla.resistencia_frio}"></div>
            <div class="property-item"><img src="../img/properties/estacion_siembra/${semilla.estacion_siembra}.png" alt="${semilla.estacion_siembra}"></div>
            <div class="property-item"><img src="../img/properties/dificultad/${semilla.dificultad}.png" alt="${semilla.dificultad}"></div>
            <div class="property-item"><img src="../img/properties/cuidados/${semilla.cuidados}.png" alt="${semilla.cuidados}"></div>
            <div class="property-item"><img src="../img/properties/produccion/${semilla.produccion}.png" alt="${semilla.produccion}"></div>
            ${semilla.invernadero ? '<div class="property-item"><img src="../img/properties/extras/invernadero.png" alt="Invernadero"></div>' : ''}
        </div>
        <p class="product-price">${semilla.precio}€</p>
        <button class="add-to-cart-btn" data-id="${semilla.id}" data-nombre="${semilla.nombre}" data-precio="${semilla.precio}" data-tipo="${semilla.tipo_planta}" ${sinStock ? 'disabled' : ''}>
            ${sinStock ? 'Sin existencias' : 'Añadir al carrito'}
        </button>
        ${isAdmin ? `
        <button class="admin-stock-btn" data-id="${semilla.id}" data-stock="${sinStock ? 'false' : 'true'}">
            ${sinStock ? 'Marcar disponible' : 'Marcar sin stock'}
        </button>
        ` : ''}
        <div class="quantity-controls" style="display: none;" data-id="${semilla.id}">
            <button class="quantity-btn minus-btn" data-id="${semilla.id}">-</button>
            <span class="quantity-display">0</span>
            <button class="quantity-btn plus-btn" data-id="${semilla.id}">+</button>
        </div>
    `;

    return productDiv;
}

function toggleCategoryVisibility() {
    Object.values(categoryContainers).forEach(list => {
        if (!list) return;
        const title = list.previousElementSibling;
        const hasProducts = list.children.length > 0;

        list.classList.toggle('hidden', !hasProducts);
        if (title && title.classList.contains('store-name')) {
            title.classList.toggle('hidden', !hasProducts);
        }
    });
}

function bindProductButtons() {
    document.querySelectorAll('.product-card').forEach(card => {
        const img = card.querySelector('.product-image');
        const fallback = card.querySelector('.product-image-fallback');

        if (!img || !fallback) return;

        img.addEventListener('error', () => {
            img.style.display = 'none';
            fallback.classList.remove('is-hidden');
        }, { once: true });
    });

    document.querySelectorAll('.add-to-cart-btn:not([disabled])').forEach(btn => {
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

    document.querySelectorAll('.admin-stock-btn').forEach(btn => {
        btn.addEventListener('click', async function() {
            const id = Number(this.getAttribute('data-id'));
            const currentStock = this.getAttribute('data-stock') === 'true';

            try {
                await updateStockAsAdmin(id, !currentStock);
                await applyFilters();
            } catch (error) {
                alert(error.message);
            }
        });
    });
}

function renderSemillas(semillas) {
    Object.values(categoryContainers).forEach(list => {
        if (list) {
            list.innerHTML = '';
        }
    });

    semillas.forEach(semilla => {
        const targetList = categoryContainers[semilla.tipo_planta];
        if (!targetList) return;
        targetList.appendChild(buildProductCard(semilla));
    });

    toggleCategoryVisibility();
    bindProductButtons();
    updateProductUI();

    const emptyState = document.getElementById('filters-empty-state');
    if (emptyState) {
        emptyState.classList.toggle('is-hidden', semillas.length > 0);
    }

    const resultCount = document.getElementById('filter-results-count');
    if (resultCount) {
        resultCount.textContent = `Mostrando ${semillas.length} resultado${semillas.length === 1 ? '' : 's'}`;
    }
}

function renderActiveFilterChips(state) {
    const container = document.getElementById('filter-active-chips');
    if (!container) return;

    const chips = [];

    if (state.searchText) {
        chips.push({ label: `Nombre: ${state.searchText}`, target: 'filter-search' });
    }

    filterConfig.forEach(({ id, key }) => {
        if (state.selected[key]) {
            chips.push({ label: `${key.replace(/_/g, ' ')}: ${formatFilterValue(state.selected[key])}`, target: id });
        }
    });

    if (state.invernadero) {
        chips.push({
            label: `Invernadero: ${state.invernadero === 'si' ? 'Si' : 'No'}`,
            target: 'filter-invernadero'
        });
    }

    if (state.minPrice !== null) {
        chips.push({ label: `Min: ${state.minPrice}€`, target: 'filter-precio-min' });
    }

    if (state.maxPrice !== null) {
        chips.push({ label: `Max: ${state.maxPrice}€`, target: 'filter-precio-max' });
    }

    if (chips.length === 0) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = chips
        .map(chip => `
            <span class="filter-chip">
                ${chip.label}
                <button type="button" aria-label="Quitar filtro" data-chip-target="${chip.target}">×</button>
            </span>
        `)
        .join('');
}

async function applyFilters() {
    const { state, params } = getApiFilterParams();

    try {
        const semillas = await fetchSemillasFromApi(params);
        const nameQuery = normalizeText(state.searchText);
        const finalSemillas = nameQuery
            ? semillas.filter(semilla => normalizeText(semilla.nombre).includes(nameQuery))
            : semillas;

        renderActiveFilterChips(state);
        renderSemillas(finalSemillas);
    } catch (error) {
        console.error('Error al aplicar filtros desde la API:', error);
    }
}

let filterApplyTimeoutId = null;

function scheduleApplyFilters() {
    clearTimeout(filterApplyTimeoutId);
    filterApplyTimeoutId = setTimeout(() => {
        applyFilters();
    }, 200);
}

function resetFilters() {
    const allFilterElements = [
        ...filterConfig.map(filter => document.getElementById(filter.id)),
        document.getElementById('filter-search'),
        document.getElementById('filter-precio-min'),
        document.getElementById('filter-precio-max'),
        document.getElementById('filter-invernadero'),
        document.getElementById('filter-sort')
    ];

    allFilterElements.forEach(element => {
        if (element) {
            element.value = '';
        }
    });

    renderActiveFilterChips({ searchText: '', selected: {}, invernadero: '', minPrice: null, maxPrice: null });
    cargarSemillas();
}

function initFilterEvents() {
    const resetBtn = document.getElementById('filter-reset');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetFilters);
    }

    const applyBtn = document.getElementById('filter-apply');
    if (applyBtn) {
        applyBtn.addEventListener('click', applyFilters);
    }

    const searchInput = document.getElementById('filter-search');
    if (searchInput) {
        searchInput.addEventListener('input', scheduleApplyFilters);
        searchInput.addEventListener('keydown', event => {
            if (event.key === 'Enter') {
                event.preventDefault();
                applyFilters();
            }
        });
    }

    [...filterConfig.map(filter => document.getElementById(filter.id)), document.getElementById('filter-invernadero'), document.getElementById('filter-sort'), document.getElementById('filter-precio-min'), document.getElementById('filter-precio-max')]
        .forEach(element => {
            if (element) {
                element.addEventListener('change', applyFilters);
            }
        });

    const chipContainer = document.getElementById('filter-active-chips');
    if (chipContainer) {
        chipContainer.addEventListener('click', event => {
            const button = event.target.closest('button[data-chip-target]');
            if (!button) return;

            const targetId = button.getAttribute('data-chip-target');
            const target = document.getElementById(targetId);
            if (!target) return;

            target.value = '';
            applyFilters();
        });
    }
}

function initAdminSeedActions() {
    const panel = document.getElementById('admin-seed-actions');
    if (!panel) return;

    const isAdmin = isAdminUser();
    panel.classList.toggle('is-hidden', !isAdmin);
    if (!isAdmin) return;

    const createForm = document.getElementById('admin-create-seed-form');
    const deleteForm = document.getElementById('admin-delete-seed-form');
    const updatePriceForm = document.getElementById('admin-update-price-form');

    createForm?.addEventListener('submit', async event => {
        event.preventDefault();

        const invernaderoRaw = document.getElementById('admin-seed-invernadero')?.value;
        const stockRaw = document.getElementById('admin-seed-stock')?.value;

        const payload = {
            nombre: document.getElementById('admin-seed-nombre')?.value.trim(),
            precio: Number(document.getElementById('admin-seed-precio')?.value),
            tipo_planta: document.getElementById('admin-seed-tipo')?.value,
            necesidad_luz: document.getElementById('admin-seed-luz')?.value,
            riego: document.getElementById('admin-seed-riego')?.value,
            resistencia_frio: document.getElementById('admin-seed-resistencia')?.value,
            estacion_siembra: document.getElementById('admin-seed-estacion')?.value,
            tiempo_cosecha: document.getElementById('admin-seed-tiempo')?.value.trim(),
            dificultad: document.getElementById('admin-seed-dificultad')?.value,
            cuidados: document.getElementById('admin-seed-cuidados')?.value,
            produccion: document.getElementById('admin-seed-produccion')?.value,
            invernadero: invernaderoRaw === 'si',
            stock: stockRaw === 'true'
        };

        const hasMissingFields = !payload.nombre
            || !Number.isFinite(payload.precio)
            || payload.precio < 0
            || !payload.tipo_planta
            || !payload.necesidad_luz
            || !payload.riego
            || !payload.resistencia_frio
            || !payload.estacion_siembra
            || !payload.tiempo_cosecha
            || !payload.dificultad
            || !payload.cuidados
            || !payload.produccion
            || !invernaderoRaw
            || !stockRaw;

        if (hasMissingFields) {
            alert('Todos los campos son obligatorios para crear la semilla');
            return;
        }

        try {
            await createSeedAsAdmin(payload);
            alert('Semilla creada correctamente');
            createForm.reset();
            await applyFilters();
        } catch (error) {
            alert(error.message);
        }
    });

    deleteForm?.addEventListener('submit', async event => {
        event.preventDefault();

        const nameInput = document.getElementById('admin-delete-seed-name');
        const seedName = String(nameInput?.value || '').trim();

        if (!seedName) {
            alert('Introduce un nombre valido');
            return;
        }

        if (!confirm(`Se eliminara la semilla "${seedName}". ¿Continuar?`)) {
            return;
        }

        try {
            await deleteSeedAsAdmin(seedName);
            alert('Semilla eliminada correctamente');
            deleteForm.reset();
            await applyFilters();
        } catch (error) {
            alert(error.message);
        }
    });

    updatePriceForm?.addEventListener('submit', async event => {
        event.preventDefault();

        const productName = String(document.getElementById('admin-price-product-name')?.value || '').trim();
        const accion = String(document.getElementById('admin-price-action')?.value || '').trim().toLowerCase();
        const monto = Number(document.getElementById('admin-price-amount')?.value);

        if (!productName) {
            alert('Introduce un nombre de producto valido');
            return;
        }

        const productMatch = semillasCatalogo.find(item => normalizeText(item?.nombre) === normalizeText(productName));
        if (!productMatch) {
            alert('No se encontro un producto con ese nombre. Revisa el nombre exacto o usa las sugerencias.');
            return;
        }

        const productId = Number(productMatch.id);

        if (!Number.isInteger(productId) || productId <= 0) {
            alert('No se pudo resolver el producto seleccionado');
            return;
        }

        if (accion !== 'subir' && accion !== 'bajar') {
            alert('Selecciona si quieres subir o bajar el precio');
            return;
        }

        if (!Number.isFinite(monto) || monto <= 0) {
            alert('Introduce un monto valido mayor que 0');
            return;
        }

        try {
            const result = await updatePriceAsAdmin(productId, accion, Number(monto.toFixed(2)));

            const updatedId = Number(result?.producto?.id ?? productId);
            const updatedPrice = Number(result?.producto?.precio);
            if (Number.isFinite(updatedId) && Number.isFinite(updatedPrice)) {
                semillasCatalogo = semillasCatalogo.map(item => (
                    Number(item?.id) === updatedId
                        ? { ...item, precio: updatedPrice }
                        : item
                ));
                updateAdminPriceProductNameOptions(semillasCatalogo);
            }

            alert(`Precio actualizado: ${result.producto.nombre} -> ${result.producto.precio}€`);
            updatePriceForm.reset();
            await applyFilters();
            await cargarSemillas();
        } catch (error) {
            alert(error.message);
        }
    });
}

// === Carrito de compras ===
function getCart() {
    const cart = localStorage.getItem('carrito');
    return cart ? JSON.parse(cart) : [];
}

function saveCart(cart) {
    localStorage.setItem('carrito', JSON.stringify(cart));
}

function isSameProductId(leftId, rightId) {
    const left = Number(leftId);
    const right = Number(rightId);

    if (Number.isFinite(left) && Number.isFinite(right)) {
        return left === right;
    }

    return String(leftId) === String(rightId);
}

function getCartCategoryKey(item) {
    const directType = String(item?.tipo_planta ?? item?.tipo ?? '').trim().toLowerCase();
    if (Object.prototype.hasOwnProperty.call(categoryContainers, directType)) {
        return directType;
    }

    const matchedSeed = semillasCatalogo.find(seed => isSameProductId(seed?.id, item?.id));
    const derivedType = String(matchedSeed?.tipo_planta || '').trim().toLowerCase();
    if (Object.prototype.hasOwnProperty.call(categoryContainers, derivedType)) {
        return derivedType;
    }

    return '';
}

function addToCart(product) {
    let cart = getCart();
    const existingItem = cart.find(item => isSameProductId(item.id, product.id));

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
    const existingItem = cart.find(item => isSameProductId(item.id, productId));

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
    const existingItem = cart.find(item => isSameProductId(item.id, productId));

    if (existingItem) {
        existingItem.cantidad--;
        if (existingItem.cantidad <= 0) {
            cart = cart.filter(item => !isSameProductId(item.id, productId));
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
        if (!addBtn || !quantityControls) return;

        const outOfStock = card.classList.contains('out-of-stock');
        if (outOfStock) {
            addBtn.style.display = 'block';
            quantityControls.style.display = 'none';
            return;
        }

        const productId = addBtn.getAttribute('data-id');

        const cartItem = cart.find(item => isSameProductId(item.id, productId));

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
    let cartWasEnriched = false;

    cart.forEach(item => {
        const categoryKey = getCartCategoryKey(item);
        const quantity = Number(item?.cantidad);
        const price = Number(item?.precio);

        if (categoryKey && Number.isFinite(quantity) && quantity > 0) {
            categoryCounts[categoryKey] += quantity;

            if (!item.tipo_planta || item.tipo_planta !== categoryKey) {
                item.tipo_planta = categoryKey;
                cartWasEnriched = true;
            }
        }

        if (Number.isFinite(price) && Number.isFinite(quantity) && quantity > 0) {
            totalPrice += price * quantity;
        }
    });

    if (cartWasEnriched) {
        saveCart(cart);
    }

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
    initDefaultFilterOptions();
    initFilterEvents();
    initAdminSeedActions();
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
