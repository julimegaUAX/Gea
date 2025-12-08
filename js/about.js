// Inicializar el mapa
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

// Modal de Contacto
const modal = document.getElementById('contactModal');
const contactBtn = document.getElementById('contactBtn');
const closeBtn = document.querySelector('.close');
const contactForm = document.getElementById('contactForm');

// Abrir modal
contactBtn.addEventListener('click', function() {
	modal.style.display = 'block';
});

// Cerrar modal al hacer clic en la X
closeBtn.addEventListener('click', function() {
	modal.style.display = 'none';
});

// Cerrar modal al hacer clic fuera del contenido
window.addEventListener('click', function(event) {
	if (event.target === modal) {
		modal.style.display = 'none';
	}
});

// Enviar formulario
contactForm.addEventListener('submit', function(e) {
	e.preventDefault();
	
	// Mostrar mensaje de éxito
	alert('¡Mensaje enviado! Nos pondremos en contacto pronto.');
	
	// Limpiar formulario
	contactForm.reset();
	
	// Cerrar modal
	modal.style.display = 'none';
});

// Menú desplegable activado
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
document.getElementById('close-icon').addEventListener('click', cerrarMenu);
document.getElementById('menu-overlay').addEventListener('click', cerrarMenu);
