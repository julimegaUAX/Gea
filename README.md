<div align="center">
  <img src="img/assets/gea.svg" alt="Gea Logo" width="200"/>
  
  # 🌱 Gea - Tienda Online de Semillas
</div>

Gea es una tienda online de semillas de plantas. El proyecto incluye **5 páginas principales**: Inicio (con estadísticas y FAQ), Tienda (catálogo de 48 productos), Carrito, Login y Sobre Nosotros.

## Estructura del Proyecto

El proyecto está organizado en carpetas claramente diferenciadas:

- **`html/`**: Contiene los 5 archivos HTML principales (index, store, cart, login, about)
- **`css/`**: Hoja de estilos específica para cada página HTML
- **`js/`**: Archivo JavaScript correspondiente a cada página con su lógica de interacción
- **`img/`**: Recursos visuales organizados por categorías de semillas (herb, veg, leg, cer, flo, fru), iconos de propiedades, y assets generales
- **`Database_y_API/`**: Backend en Flask + PostgreSQL con endpoints REST (`/GEA/signup`, `/GEA/login`, `/GEA/semillas`, `/GEA/checkout`, etc...)

## Arranque del Backend

La carpeta de backend es `Database_y_API`, arranca la API con :

```bash
python Database_y_API/server.py
```

La API está en `http://127.0.0.1:5001` para evitar conflictos con otros proyectos locales. El frontend ya apunta a esa URL.

## Modelo de Base de Datos (TABLAS)

<div align="center">
  <img src="img/readme/ER_DATABASE_GEA.png" alt="Diagrama ER Base de Datos" width="500"/>
</div>

Todas las primary keys y las foreign keys se pueden ver en la imagen anterior, al igual que el tipo de relaciones que existen entre las tablas

- **users**: Almacena información de usuarios (email, contraseña, rol) para gestionar acceso y autenticación.
- **cat**: Contiene las 6 categorías de productos para organizar el catálogo de semillas.
- **prod**: Tabla principal con todos los productos, sus propiedades de cultivo (luz, riego, dificultad, etc.) y datos comerciales (precio, stock).
- **compra**: Registra las órdenes de compra realizadas por usuarios con el precio total de cada transacción.
- **compras_lineas**: Detalla los artículos incluidos en cada compra, vinculando productos con su precio específico en esa orden.
- **contactos**: Almacena datos de contacto de usuarios (nombre, email, teléfono, mensajes) para la comunicación.

## Peticiones API

- **GET /GEA/root**: Verifica que la API está funcionando.
- **GET /GEA/info**: Devuelve información general de la página.
- **GET /GEA/semillas**: Obtiene el catálogo de semillas con filtros opcionales (categoría, dificultad, etc.).
- **POST /GEA/signup**: Registra un nuevo usuario con email, contraseña y validación.
- **POST /GEA/login**: Inicia sesión.
- **POST /GEA/reset-password**: Restablecimiento de contraseña por email.
- **POST /GEA/checkout**: Guarda una compra en la base de datos con sus artículos, cantidades y precio total
- **GET /GEA/compras**: Obtiene el historial de compras del usuario autenticado.
- **POST /GEA/contacto**: Guarda un formulario de contacto con nombre, email, teléfono y mensaje.
- **POST /GEA/admin/productos**: Crea una nueva semilla (solo administrador).
- **DELETE /GEA/admin/productos**: Elimina una semilla por nombre (solo administrador).
- **PATCH /GEA/admin/productos/{id_prod}/precio**: Actualiza el precio de un producto (solo administrador).
- **PATCH /GEA/admin/productos/{id_prod}/stock**: Actualiza el stock de un producto (solo administrador).

Además, se implementó HATEOAS en los endpoints de la API para ayudar en la navegación 
## Responsive Design

El diseño web se adapta a **4 resoluciones diferentes**:

- **Mini** (smartphones pequeños)
- **Móvil** (smartphones estándar)
- **Tablet** (tablets y dispositivos medianos)
- **Ordenador** (escritorio y pantallas grandes)

Se utilizan media queries y sobre todo grid que ayuda a cambiar entre dimensiones.

## Datos: semillas.json

El archivo `semillas.json` contiene **48 productos** generados con datos simulados para el funcionamiento de la tienda. Cada producto incluye:

- **id**: Identificador único (Primary Key)
- **nombre**: Nombre de la semilla
- **precio**: Precio en euros
- **tipo**: Categoría (hierbas, vegetales, legumbres, cereales, flores, frutas)
- **8 propiedades**: Cuidados, dificultad, estación de siembra, luz, producción, resistencia al frío, riego y extras

Estos datos se cargan dinámicamente mediante `fetch()` en la página de la tienda.

## Navegación

<div align="center">
  <img src="img/readme/nav.png" alt="Header Navigation" width="600"/>
</div>

La navegación del sitio cuenta con:

- **Header**: Logo de Gea (favicon), menú de navegación para acceder a todas las secciones (Inicio, Tienda, Sobre Nosotros), iconos de login y carrito
- **Footer**: Links rápidos a todas las páginas, iconos de redes sociales (Instagram, Facebook, Twitter) y datos de contacto (email, teléfono, dirección)

## Estructura de la Tienda (Store)

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
  <img src="img/readme/product.png" alt="Ejemplo tarjeta producto" width="250"/>
</div>

## Login

El diseño de la página de login está basado en [este tutorial de YouTube](https://youtu.be/PlpM2LJWu-s).

Características principales:
- **Nav transparente** con efectos de blur y brightness
- **Container central** con formulario de acceso
- **Diseño responsive vertical**: A diferencia del tutorial original (horizontal), optamos por una disposición vertical para optimizar la visualización en móvil y mini

## Páginas del Proyecto

### Index (Inicio)

5 secciones principales:
1. **Hero**
2. **Intro**
3. **Stats**
4. **Benefits**
5. **FAQ**

### Cart (Carrito)
**JavaScript**:
- `renderCart()`: Genera la tabla desde localStorage
- `updateQuantity()`: Incrementa/decrementa cantidades
- `removeFromCart()`: Elimina productos
- `calculateTotals()`: Calcula el total del carrito

### About (Sobre Nosotros)

1. **Misión/Visión/Valores**
2. **Equipo**
3. **Timeline**
4. **Mapa**
5. **Call to Action**

## Diseño de Imagenes
- **Contenido generado con IA**: La mayoría de textos e imágenes fueron creados con IA para facilitar el trabajo y centrarse en el diseño web
  
## Mejoras Futuras del Proyecto

- **Página de detalle por producto**: Implementar con Angular para mostrar información completa de cada semilla
- **Sistema de filtrado avanzado**: Filtros por propiedades (dificultad, estación, tipo de riego, etc.)
---
<div align="center">
  <strong>Desarrollado con 💚 por el equipo de Gea</strong>
  <br>
  Miguel, Julio y Dimitiz
</div>
