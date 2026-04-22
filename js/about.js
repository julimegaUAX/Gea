// Inicializar el mapa solo si Leaflet y el contenedor están disponibles.
if (window.L && document.getElementById('map')) {
	const map = L.map('map').setView([40.460850004208766, -3.727558249677546], 15);

	// Añadir capa de tiles de OpenStreetMap
	L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		maxZoom: 19,
		attribution: '© OpenStreetMap contributors'
	}).addTo(map);

	// Añadir marcador con popup
	const marker = L.marker([40.460850004208766, -3.727558249677546]).addTo(map);
	marker.bindPopup(`
		<div class="popup-content">
        <div class="popup-title">Gea</div>
			<div class="popup-subtitle">Plantas y Semillas</div>
			<img src="../img/assets/Tienda_fisica.png" alt="Gea Tienda Física">
			<div class="popup-address">C/ Primavera 27, Madrid</div>
			<div class="popup-hours">Lunes-Viernes: 9:00-18:00</div>
		</div>
	`, { maxWidth: 200 });
}

const API_BASE_URL = 'http://127.0.0.1:5001/GEA';

function getCurrentUser() {
	const raw = localStorage.getItem('gea_user');
	if (!raw) return null;

	try {
		return JSON.parse(raw);
	} catch {
		return null;
	}
}

async function postJson(url, body) {
	const response = await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(body)
	});

	const data = await response.json();
	if (!response.ok || !data.ok) {
		throw new Error(data.message || 'No se pudo guardar el contacto');
	}

	return data;
}

// Modal de Contacto
const modal = document.getElementById('contactModal');
const contactBtn = document.getElementById('contactBtn');
const closeBtn = modal?.querySelector('.close') || document.querySelector('.close');
const contactForm = document.getElementById('contactForm') || modal?.querySelector('form');
const contactSubmitBtn = modal?.querySelector('.btn-submit') || document.querySelector('#contactForm .btn-submit');

function getFormValue(form, byId, byName) {
	if (!form) return '';
	const byIdEl = byId ? document.getElementById(byId) : null;
	const byNameEl = byName ? form.querySelector(`[name="${byName}"]`) : null;
	return String(byIdEl?.value ?? byNameEl?.value ?? '').trim();
}

// Abrir modal
contactBtn?.addEventListener('click', function() {
	if (modal) {
		modal.style.display = 'block';
	}
});

// Cerrar modal al hacer clic en la X
closeBtn?.addEventListener('click', function() {
	if (modal) {
		modal.style.display = 'none';
	}
});

// Cerrar modal al hacer clic fuera del contenido
window.addEventListener('click', function(event) {
	if (modal && event.target === modal) {
		modal.style.display = 'none';
	}
});

async function submitContactForm() {
	const user = getCurrentUser();
	const idUser = Number(user?.id_user ?? user?.id);
	if (!Number.isFinite(idUser) || idUser <= 0) {
		alert('Debes iniciar sesion para enviar el formulario de contacto.');
		return false;
	}

	const payload = {
		id_user: idUser,
		nombre: getFormValue(contactForm, 'name', 'name') || getFormValue(contactForm, null, 'nombre'),
		email: getFormValue(contactForm, 'email', 'email'),
		telefono: getFormValue(contactForm, 'phone', 'phone') || getFormValue(contactForm, null, 'telefono'),
		mensaje: getFormValue(contactForm, 'message', 'message') || getFormValue(contactForm, null, 'mensaje'),
	};

	if (!payload.nombre || !payload.email || !payload.mensaje) {
		alert('Completa nombre, email y mensaje.');
		return false;
	}

	try {
		await postJson(`${API_BASE_URL}/contacto`, payload);
		alert('¡Mensaje enviado! Nos pondremos en contacto pronto.');
		contactForm.reset();
		if (modal) {
			modal.style.display = 'none';
		}
		return true;
	} catch (error) {
		alert(error.message);
		return false;
	}
}

// Enviar formulario
contactForm?.addEventListener('submit', async function(e) {
	e.preventDefault();
	await submitContactForm();
});

// Fallback: si el boton no dispara submit (por tipo o posicion), enviamos manualmente.
contactSubmitBtn?.addEventListener('click', async function(e) {
	const isNativeSubmit = contactForm && this.type === 'submit' && this.form === contactForm;
	if (isNativeSubmit) {
		return;
	}
	e.preventDefault();
	await submitContactForm();
});

// Menú desplegable activado
document.getElementById('menu-icon')?.addEventListener('click', function() {
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

// Función para cerrar el menú
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
document.getElementById('close-icon')?.addEventListener('click', cerrarMenu);
document.getElementById('menu-overlay')?.addEventListener('click', cerrarMenu);
