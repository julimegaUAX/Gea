// Cargar carrito desde localStorage
const API_BASE_URL = 'http://127.0.0.1:5001/GEA';

function redirectToLogin() {
    window.location.href = 'login.html?next=cart';
}

function getCart() {
    const cart = localStorage.getItem('carrito');
    return cart ? JSON.parse(cart) : [];
}

function saveCart(cart) {
    localStorage.setItem('carrito', JSON.stringify(cart));
}

function getLoggedUserId() {
    const userRaw = localStorage.getItem('gea_user');
    if (!userRaw) {
        return null;
    }

    try {
        const user = JSON.parse(userRaw);
        const idUser = Number(user.id_user ?? user.id);
        if (!Number.isFinite(idUser) || idUser <= 0) {
            return null;
        }
        return idUser;
    } catch (error) {
        return null;
    }
}

function hidePurchaseHistory() {
    const historySection = document.getElementById('purchase-history');
    const historyContent = document.getElementById('purchase-history-content');
    if (historySection) {
        historySection.style.display = 'none';
    }
    if (historyContent) {
        historyContent.innerHTML = '';
    }
}

function renderPurchaseHistory(compras) {
    const historySection = document.getElementById('purchase-history');
    const historyContent = document.getElementById('purchase-history-content');

    if (!historySection || !historyContent) {
        return;
    }

    window.__purchaseHistoryData = Array.isArray(compras) ? compras : [];
    historySection.style.display = 'block';

    if (!Array.isArray(compras) || compras.length === 0) {
        historyContent.innerHTML = '<p class="history-empty">No tienes compras registradas todavía.</p>';
        return;
    }

    historyContent.innerHTML = compras
        .map((compra, index) => {
            const lineas = Array.isArray(compra.lineas) ? compra.lineas : [];
            const lineasHtml = lineas
                .map(
                    linea => `
                        <li>
                            <span>${linea.nombre} x${linea.cant}</span>
                            <span>${Number(linea.subtotal).toFixed(2)}€</span>
                        </li>
                    `
                )
                .join('');

            const total = Number(compra.total).toFixed(2);
            const lineasFinales = lineasHtml || '<li><span>Sin productos registrados</span></li>';
            const compraEtiqueta = getPurchaseOrdinalLabel(index);

            return `
                <details class="purchase-item">
                    <summary class="purchase-summary">
                        <span class="purchase-ordinal">${compraEtiqueta}</span>
                        <span>Compra de ${total}€</span>
                    </summary>
                    <ul class="purchase-lines">
                        ${lineasFinales}
                    </ul>
                    <div class="purchase-actions">
                        <button type="button" class="repeat-purchase-btn" data-purchase-index="${index}">Repetir compra</button>
                    </div>
                </details>
            `;
        })
        .join('');
}

function getPurchaseOrdinalLabel(index) {
    const labels = [
        'Primera compra',
        'Segunda compra',
        'Tercera compra',
        'Cuarta compra',
        'Quinta compra',
        'Sexta compra',
        'Séptima compra',
        'Octava compra',
        'Novena compra',
        'Décima compra',
    ];

    if (index >= 0 && index < labels.length) {
        return labels[index];
    }

    return `Compra ${index + 1}`;
}

function repeatPurchase(compra) {
    const lineas = Array.isArray(compra.lineas) ? compra.lineas : [];
    if (lineas.length === 0) {
        alert('Esta compra no tiene productos para repetir');
        return;
    }

    const cart = lineas
        .map(linea => {
            const quantity = Number(linea.cant);
            const subtotal = Number(linea.subtotal);
            const unitPrice = quantity > 0 ? subtotal / quantity : 0;

            return {
                id: String(linea.id_prod),
                nombre: linea.nombre,
                precio: Number(unitPrice.toFixed(2)),
                cantidad: quantity,
            };
        })
        .filter(item => Number.isFinite(Number(item.id)) && item.cantidad > 0 && item.precio > 0);

    if (cart.length === 0) {
        alert('No se pudieron reconstruir los productos de esta compra');
        return;
    }

    saveCart(cart);
    renderCart();
    alert('Compra cargada en el carrito');
}

async function loadPurchaseHistory() {
    const idUser = getLoggedUserId();
    if (!idUser) {
        alert('Debes iniciar sesion para ver tus compras anteriores');
        redirectToLogin();
        return;
    }

    const historyButton = document.getElementById('btn-history');
    if (historyButton) {
        historyButton.disabled = true;
        historyButton.textContent = 'Cargando compras...';
    }

    try {
        const response = await fetch(`${API_BASE_URL}/compras?id_user=${encodeURIComponent(idUser)}`);
        const result = await response.json();

        if (!response.ok || !result.ok) {
            throw new Error(result.message || 'No se pudo cargar el historial');
        }

        renderPurchaseHistory(result.compras);
    } catch (error) {
        alert(error.message);
    } finally {
        if (historyButton) {
            historyButton.disabled = false;
            historyButton.textContent = 'Ver tus compras anteriores';
        }
    }
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
    hidePurchaseHistory();
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
                    <input type="number" class="qty-input" value="${item.cantidad}" data-index="${index}" data-product-id="${item.id}" min="1">
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
    const total = getCartTotal(cart); // Sin costos de envío

    document.getElementById('subtotal').textContent = total.toFixed(2) + '€';
    document.getElementById('total').textContent = total.toFixed(2) + '€';
}

function getCartTotal(cart) {
    return cart.reduce((sum, item) => sum + (Number(item.precio) * Number(item.cantidad)), 0);
}

function syncCartQuantitiesFromDOM() {
    const cart = getCart();
    const inputs = document.querySelectorAll('.qty-input');

    inputs.forEach(input => {
        const productId = input.getAttribute('data-product-id');
        const quantity = parseInt(input.value, 10);

        if (!productId || !Number.isFinite(quantity) || quantity <= 0) {
            return;
        }

        const cartItem = cart.find(item => item.id === productId);
        if (cartItem) {
            cartItem.cantidad = quantity;
        }
    });

    saveCart(cart);
    return cart;
}

function bindCheckoutButton() {
    const checkoutButton = document.querySelector('.btn-checkout');
    if (!checkoutButton) {
        return;
    }

    checkoutButton.addEventListener('click', async function() {
        const cart = getCart();
        if (cart.length === 0) {
            alert('El carrito está vacío');
            return;
        }

        const userRaw = localStorage.getItem('gea_user');
        if (!userRaw) {
            alert('Debes iniciar sesion para finalizar la compra');
            redirectToLogin();
            return;
        }

        let user;
        try {
            user = JSON.parse(userRaw);
        } catch (error) {
            alert('Sesion invalida. Vuelve a iniciar sesion.');
            localStorage.removeItem('gea_user');
            redirectToLogin();
            return;
        }

        const idUser = Number(user.id_user ?? user.id);
        if (!Number.isFinite(idUser) || idUser <= 0) {
            alert('Sesion invalida. Vuelve a iniciar sesion.');
            localStorage.removeItem('gea_user');
            redirectToLogin();
            return;
        }

        try {
            const syncedCart = syncCartQuantitiesFromDOM();
            const lineas = syncedCart
                .map(item => ({
                    id_prod: Number(item.id),
                    cant: Number(item.cantidad),
                    precio_unitario: Number(item.precio),
                }))
                .filter(
                    linea =>
                        Number.isFinite(linea.id_prod) &&
                        linea.id_prod > 0 &&
                        Number.isFinite(linea.cant) &&
                        linea.cant > 0 &&
                        Number.isFinite(linea.precio_unitario) &&
                        linea.precio_unitario > 0
                );

            if (lineas.length === 0) {
                alert('No hay lineas validas en el carrito');
                return;
            }

            const totalPedido = Number(getCartTotal(syncedCart).toFixed(2));

            const response = await fetch(`${API_BASE_URL}/checkout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id_user: idUser,
                    lineas: lineas,
                    total_pedido: totalPedido
                })
            });

            const result = await response.json();
            if (!response.ok || !result.ok) {
                throw new Error(result.message || 'No se pudo guardar el pedido');
            }

            alert(`Pedido #${result.id_pedido} guardado. Total: ${result.total}€`);
            saveCart([]);
            renderCart();
        } catch (error) {
            alert(error.message);
        }
    });
}

function bindMenuControls() {
    const menuIcon = document.getElementById('menu-icon');
    const closeIcon = document.getElementById('close-icon');
    const overlay = document.getElementById('menu-overlay');

    if (menuIcon) {
        menuIcon.addEventListener('click', function() {
            const menu = document.querySelector('.menu-desplegable');
            if (!menu || !overlay || !closeIcon) {
                return;
            }

            menu.classList.add('active');
            overlay.classList.add('active');
            menuIcon.style.display = 'none';
            closeIcon.style.display = 'block';
            document.body.style.overflow = 'hidden';
        });
    }

    if (closeIcon) {
        closeIcon.addEventListener('click', cerrarMenu);
    }

    if (overlay) {
        overlay.addEventListener('click', cerrarMenu);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    renderCart();
    bindCheckoutButton();
    bindMenuControls();

    const historyButton = document.getElementById('btn-history');
    if (historyButton) {
        historyButton.addEventListener('click', loadPurchaseHistory);
    }

    const purchaseHistoryContent = document.getElementById('purchase-history-content');
    if (purchaseHistoryContent) {
        purchaseHistoryContent.addEventListener('click', function(event) {
            const target = event.target;
            if (!(target instanceof HTMLElement)) {
                return;
            }

            const repeatButton = target.closest('.repeat-purchase-btn');
            if (!repeatButton) {
                return;
            }

            const index = Number(repeatButton.getAttribute('data-purchase-index'));
            if (!Number.isInteger(index)) {
                return;
            }

            const currentUserId = getLoggedUserId();
            if (!currentUserId) {
                alert('Debes iniciar sesion para repetir una compra');
                redirectToLogin();
                return;
            }

            const purchaseData = window.__purchaseHistoryData || [];
            const compra = purchaseData[index];
            if (!compra) {
                alert('No se encontró la compra seleccionada');
                return;
            }

            repeatPurchase(compra);
        });
    }

    // Fallback por delegacion si el listener directo no llegara a enlazarse.
    document.addEventListener('click', function(event) {
        const target = event.target;
        if (target && target.id === 'btn-history') {
            loadPurchaseHistory();
        }
    });
});

// Función para cerrar el menú
function cerrarMenu() {
    const menu = document.querySelector('.menu-desplegable');
    const overlay = document.getElementById('menu-overlay');
    const menuIcon = document.getElementById('menu-icon');
    const closeIcon = document.getElementById('close-icon');
    
    if (!menu || !overlay || !menuIcon || !closeIcon) {
        return;
    }

    menu.classList.remove('active');
    overlay.classList.remove('active');
    menuIcon.style.display = 'block';
    closeIcon.style.display = 'none';
    document.body.style.overflow = 'auto';
}
