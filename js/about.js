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
