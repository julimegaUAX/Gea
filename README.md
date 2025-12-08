<div align="center">
  <img src="img/assets/gea.svg" alt="Gea Logo" width="200"/>
  
  # 🌱 Gea - Tienda Online de Semillas
</div>

---

Gea es una tienda online de semillas de plantas. El proyecto incluye **5 páginas principales**: Inicio (con estadísticas y FAQ), Tienda (catálogo de 48 productos), Carrito, Login y Sobre Nosotros.

## 📁 Estructura del Proyecto

El proyecto está organizado en carpetas claramente diferenciadas:

- **`html/`**: Contiene los 5 archivos HTML principales (index, store, cart, login, about)
- **`css/`**: Hoja de estilos específica para cada página HTML
- **`js/`**: Archivo JavaScript correspondiente a cada página con su lógica de interacción
- **`img/`**: Recursos visuales organizados por categorías de semillas (herb, veg, leg, cer, flo, fru), iconos de propiedades, y assets generales
- **`data/`**: Archivos JSON con información de productos (semillas.json) y usuarios

Cada página `.html` tiene su respectivo `.css` y `.js`, lo que facilita el mantenimiento y escalabilidad del proyecto.

## 📱 Responsive Design

El diseño web se adapta a **4 resoluciones diferentes**:

- **Mini** (smartphones pequeños)
- **Móvil** (smartphones estándar)
- **Tablet** (tablets y dispositivos medianos)
- **Ordenador** (escritorio y pantallas grandes)

Se utilizan media queries y técnicas de Grid/Flexbox para garantizar una experiencia óptima en todos los dispositivos.

## 🌾 Datos: semillas.json

El archivo `semillas.json` contiene **48 productos** generados con datos simulados para el funcionamiento de la tienda. Cada producto incluye:

- **id**: Identificador único
- **nombre**: Nombre de la semilla
- **precio**: Precio en euros
- **tipo**: Categoría (hierbas, vegetales, legumbres, cereales, flores, frutas)
- **8 propiedades**: Cuidados, dificultad, estación de siembra, luz, producción, resistencia al frío, riego y extras

Estos datos se cargan dinámicamente mediante `fetch()` en la página de la tienda.

## 🧭 Navegación

<div align="center">
  <img src="https://i.imgur.com/placeholder.png" alt="Header Navigation" width="600"/>
</div>

La navegación del sitio cuenta con:

- **Header**: Logo de Gea (favicon), menú de navegación para acceder a todas las secciones (Inicio, Tienda, Sobre Nosotros), iconos de login y carrito
- **Footer**: Links rápidos a todas las páginas, iconos de redes sociales (Instagram, Facebook, Twitter) y datos de contacto (email, teléfono, dirección)

El header permanece fijo en la parte superior para facilitar la navegación en todas las páginas.

## 🛒 Estructura de la Tienda (Store)

La página de la tienda sigue esta estructura visual:

1. **Sección de Propiedades**: Display grid con los 8 iconos de cultivo y su explicación (luz, riego, dificultad, etc.)

2. **Categorías de Productos**: 6 secciones principales
   - Hierbas Aromáticas
   - Vegetales
   - Legumbres
   - Cereales
   - Flores
   - Frutas

3. **Tarjetas de Producto**: Cada producto muestra:
   - Imagen ilustrativa
   - Nombre de la semilla
   - Iconos de propiedades correspondientes
   - Precio
   - Botón "Añadir al carrito"

4. **Cart Footer**: Barra inferior fija con:
   - Contadores por categoría de productos seleccionados
   - Total acumulado del carrito
   - Botón "Continuar" para proceder al pago

<div align="center">
  <img src="https://i.imgur.com/placeholder2.png" alt="Ejemplo tarjeta producto" width="250"/>
</div>

## 🔐 Login

El diseño de la página de login está basado en [este tutorial de YouTube](https://youtu.be/PlpM2LJWu-s).

Características principales:
- **Nav transparente** con efectos de blur y brightness
- **Container central** con formulario de acceso
- **Diseño responsive vertical**: A diferencia del tutorial original (horizontal), optamos por una disposición vertical para optimizar la visualización en móvil y mini

## 📄 Páginas del Proyecto

### 🏠 Index (Inicio)

5 secciones principales:
1. **Hero**: Imagen de fondo con call-to-action "Ver Catálogo"
2. **Intro**: Descripción de qué es GEA
3. **Stats**: Grid de 4 tarjetas (clientes, variedades, sostenibilidad, envío)
4. **Benefits**: Grid de 4 beneficios con iconos
5. **FAQ**: Acordeón interactivo con 5 preguntas (una abierta a la vez con jQuery)

### 🛍️ Cart (Carrito)

**Estado vacío**: Mensaje informativo + botón para ir a la tienda

**Con productos**: Tabla dinámica generada desde localStorage con:
- Imagen y nombre del producto
- Precio unitario
- Controles de cantidad (+/-)
- Subtotal por producto
- Botón eliminar

**Botones de acción**:
- "Proceder al pago": Muestra alerta de confirmación
- "Seguir comprando": Redirige a la tienda

**JavaScript**:
- `renderCart()`: Genera la tabla desde localStorage
- `updateQuantity()`: Incrementa/decrementa cantidades
- `removeFromCart()`: Elimina productos
- `calculateTotals()`: Calcula el total del carrito

### ℹ️ About (Sobre Nosotros)

Cuenta con 5 secciones + formulario de contacto:

1. **Misión/Visión/Valores**: 3 tarjetas con la filosofía de GEA
2. **Equipo**: Presentación del equipo (3 tarjetas)
3. **Timeline**: Historia de Gea 2023-2025 (3 tarjetas)
4. **Mapa**: Leaflet con marcador de la tienda física + popup informativo
5. **Call to Action**: 
   - Botón "Contactar" que abre formulario
   - Botón "Ver tienda" que redirige al catálogo

**Formulario de contacto**: Nombre, Email, Teléfono, Mensaje (todos required) con alerta de confirmación al enviar

## 🛠️ Tecnologías

- **HTML5**: Estructura semántica
- **CSS3**: Grid, Flexbox, animaciones y transiciones
- **JavaScript (ES6+)**: Interactividad y manipulación del DOM
- **jQuery**: Efectos y animaciones del acordeón
- **Leaflet**: Mapas interactivos
- **localStorage**: Persistencia del carrito entre sesiones
- **Fetch API**: Carga asíncrona de datos desde JSON

## 🎨 Características Generales

- **Header**: Favicon de Gea + navegación a todas las secciones
- **Footer**: Links rápidos, redes sociales y datos de contacto
- **Contenido generado con IA**: La mayoría de textos e imágenes fueron creados con IA para facilitar el trabajo y centrarse en el diseño web

## 🚀 Instalación

1. Clona el repositorio:
```bash
git clone https://github.com/julimegaUAX/Gea.git
```

2. Navega al directorio:
```bash
cd Gea
```

3. Abre con un servidor local:
```bash
# Python 3
python -m http.server 8000

# Node.js
npx http-server
```

4. Accede a: `http://localhost:8000/html/index.html`

## 🔮 Mejoras Futuras del Proyecto

- **Página de detalle por producto**: Implementar con Angular para mostrar información completa de cada semilla
- **Sistema de filtrado avanzado**: Filtros por propiedades (dificultad, estación, tipo de riego, etc.)
- **Backend completo**: Gestión de pedidos y stock en tiempo real
- **Sistema de reseñas**: Valoraciones y comentarios de usuarios

---

<div align="center">
  <strong>Desarrollado con 💚 por el equipo de Gea</strong>
  <br>
  Miguel, Julio y Dimitiz
</div>
