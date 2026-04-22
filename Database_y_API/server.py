import json
import os

from flask import Flask, jsonify, request
from dotenv import load_dotenv

try:
    from database import (
        create_seed_product,
        create_purchase,
        create_user,
        delete_seed_product_by_name,
        get_purchases_by_user,
        get_seed_catalog,
        get_user_by_id,
        get_user_by_email,
        get_user_by_username,
        init_db,
        save_contact,
        update_product_price,
        update_user_password_by_email,
        update_product_stock,
    )
except ImportError:
    from .database import (
        create_seed_product,
        create_purchase,
        create_user,
        delete_seed_product_by_name,
        get_purchases_by_user,
        get_seed_catalog,
        get_user_by_id,
        get_user_by_email,
        get_user_by_username,
        init_db,
        save_contact,
        update_product_price,
        update_user_password_by_email,
        update_product_stock,
    )

app = Flask(__name__)
load_dotenv()

API_HOST = os.getenv("API_HOST", "127.0.0.1")
API_PORT = int(os.getenv("API_PORT", "5001"))
API_PREFIX = os.getenv("API_PREFIX", "GEA").strip("/") or "GEA"


def _api_url(path=""):
    return f"http://{API_HOST}:{API_PORT}/{API_PREFIX}{path}"


def _site_url(path=""):
    return f"http://{API_HOST}:{API_PORT}{path}"


def _link(path, method="GET"):
    link = {"href": _api_url(path)}
    if method:
        link["method"] = method
    return link


def _api_links(extra_links=None):
    links = {
        "self": _link("/root", "GET"),
        "signup": _link("/signup", "POST"),
        "login": _link("/login", "POST"),
        "reset_password": _link("/reset-password", "POST"),
        "semillas": _link("/semillas", "GET"),
        "checkout": _link("/checkout", "POST"),
        "contacto": _link("/contacto", "POST"),
        "compras": _link("/compras", "GET"),
        "root": _link("/root", "GET"),
        "info": _link("/info", "GET"),
    }
    if extra_links:
        links.update(extra_links)
    return links


def get_openapi_spec():
    return {
        "openapi": "3.0.3",
        "info": {
            "title": "Gea API",
            "version": "1.0.0",
            "description": "API REST de Gea para autenticacion, catalogo y checkout.",
        },
        "servers": [{"url": f"http://{API_HOST}:{API_PORT}"}],
        "paths": {
            f"/{API_PREFIX}/root": {
                "get": {
                    "summary": "Comprobar si la API esta funcionando",
                    "responses": {"200": {"description": "Estado general de la API"}},
                }
            },
            f"/{API_PREFIX}/info": {
                "get": {
                    "summary": "Informacion general de la pagina",
                    "responses": {"200": {"description": "Informacion general del proyecto"}},
                }
            },
            f"/{API_PREFIX}/signup": {
                "post": {
                    "summary": "Registrar usuario",
                    "requestBody": {
                        "required": True,
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "properties": {
                                        "nombre": {"type": "string"},
                                        "email": {"type": "string"},
                                        "password": {"type": "string"},
                                    },
                                }
                            }
                        },
                    },
                    "responses": {"201": {"description": "Cuenta creada"}},
                }
            },
            f"/{API_PREFIX}/login": {
                "post": {
                    "summary": "Iniciar sesion",
                    "requestBody": {
                        "required": True,
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "properties": {
                                        "email": {"type": "string"},
                                        "password": {"type": "string"},
                                    },
                                }
                            }
                        },
                    },
                    "responses": {"200": {"description": "Sesion iniciada"}},
                }
            },
            f"/{API_PREFIX}/reset-password": {
                "post": {
                    "summary": "Restablecer contrasena por email",
                    "requestBody": {
                        "required": True,
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "properties": {
                                        "email": {"type": "string"},
                                        "password": {"type": "string"},
                                    },
                                }
                            }
                        },
                    },
                    "responses": {"200": {"description": "Contrasena actualizada"}},
                }
            },
            f"/{API_PREFIX}/semillas": {
                "get": {
                    "summary": "Obtener catalogo filtrable",
                    "parameters": [
                        {"name": "nombre", "in": "query", "schema": {"type": "string"}},
                        {"name": "tipo_planta", "in": "query", "schema": {"type": "string"}},
                        {"name": "necesidad_luz", "in": "query", "schema": {"type": "string"}},
                        {"name": "riego", "in": "query", "schema": {"type": "string"}},
                        {"name": "resistencia_frio", "in": "query", "schema": {"type": "string"}},
                        {"name": "estacion_siembra", "in": "query", "schema": {"type": "string"}},
                        {"name": "tiempo_cosecha", "in": "query", "schema": {"type": "string"}},
                        {"name": "dificultad", "in": "query", "schema": {"type": "string"}},
                        {"name": "cuidados", "in": "query", "schema": {"type": "string"}},
                        {"name": "produccion", "in": "query", "schema": {"type": "string"}},
                        {"name": "invernadero", "in": "query", "schema": {"type": "string"}},
                        {"name": "precio_min", "in": "query", "schema": {"type": "number"}},
                        {"name": "precio_max", "in": "query", "schema": {"type": "number"}},
                        {"name": "sort", "in": "query", "schema": {"type": "string"}},
                    ],
                    "responses": {"200": {"description": "Catalogo"}},
                }
            },
            f"/{API_PREFIX}/checkout": {
                "post": {
                    "summary": "Guardar compra",
                    "responses": {"200": {"description": "Pedido guardado"}},
                }
            },
            f"/{API_PREFIX}/contacto": {
                "post": {
                    "summary": "Guardar formulario de contacto",
                    "requestBody": {
                        "required": True,
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "required": ["id_user", "nombre", "email", "mensaje"],
                                    "properties": {
                                        "id_user": {"type": "integer"},
                                        "nombre": {"type": "string"},
                                        "email": {"type": "string"},
                                        "telefono": {"type": "string"},
                                        "mensaje": {"type": "string"},
                                    },
                                }
                            }
                        },
                    },
                    "responses": {"200": {"description": "Contacto guardado"}},
                }
            },
            f"/{API_PREFIX}/compras": {
                "get": {
                    "summary": "Obtener historial de compras por usuario",
                    "parameters": [
                        {"name": "id_user", "in": "query", "required": True, "schema": {"type": "integer"}}
                    ],
                    "responses": {"200": {"description": "Historial de compras"}},
                }
            },
            f"/{API_PREFIX}/admin/productos/{{id_prod}}/stock": {
                "patch": {
                    "summary": "Actualizar stock de producto (solo admin)",
                    "parameters": [
                        {"name": "id_prod", "in": "path", "required": True, "schema": {"type": "integer"}}
                    ],
                    "requestBody": {
                        "required": True,
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "properties": {
                                        "id_user": {"type": "integer"},
                                        "stock": {"type": "boolean"},
                                    },
                                }
                            }
                        },
                    },
                    "responses": {"200": {"description": "Stock actualizado"}, "403": {"description": "Solo admin"}},
                }
            },
            f"/{API_PREFIX}/admin/productos/{{id_prod}}/precio": {
                "patch": {
                    "summary": "Subir o bajar precio de producto (solo admin)",
                    "parameters": [
                        {"name": "id_prod", "in": "path", "required": True, "schema": {"type": "integer"}}
                    ],
                    "requestBody": {
                        "required": True,
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "properties": {
                                        "id_user": {"type": "integer"},
                                        "accion": {"type": "string", "enum": ["subir", "bajar"]},
                                        "monto": {"type": "number"},
                                    },
                                }
                            }
                        },
                    },
                    "responses": {"200": {"description": "Precio actualizado"}, "403": {"description": "Solo admin"}},
                }
            },
            f"/{API_PREFIX}/admin/productos": {
                "post": {
                    "summary": "Crear semilla (solo admin)",
                    "requestBody": {
                        "required": True,
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "required": [
                                        "id_user",
                                        "nombre",
                                        "precio",
                                        "tipo_planta",
                                        "necesidad_luz",
                                        "riego",
                                        "resistencia_frio",
                                        "estacion_siembra",
                                        "tiempo_cosecha",
                                        "dificultad",
                                        "cuidados",
                                        "produccion",
                                        "invernadero",
                                        "stock"
                                    ],
                                    "properties": {
                                        "id_user": {"type": "integer"},
                                        "nombre": {"type": "string"},
                                        "precio": {"type": "number"},
                                        "tipo_planta": {"type": "string"},
                                        "necesidad_luz": {"type": "string"},
                                        "riego": {"type": "string"},
                                        "resistencia_frio": {"type": "string"},
                                        "estacion_siembra": {"type": "string"},
                                        "tiempo_cosecha": {"type": "string"},
                                        "dificultad": {"type": "string"},
                                        "cuidados": {"type": "string"},
                                        "produccion": {"type": "string"},
                                        "invernadero": {"type": "boolean"},
                                        "stock": {"type": "boolean"},
                                    },
                                }
                            }
                        },
                    },
                    "responses": {"201": {"description": "Semilla creada"}, "403": {"description": "Solo admin"}},
                },
                "delete": {
                    "summary": "Eliminar semilla por nombre (solo admin)",
                    "requestBody": {
                        "required": True,
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "properties": {
                                        "id_user": {"type": "integer"},
                                        "nombre": {"type": "string"},
                                    },
                                }
                            }
                        },
                    },
                    "responses": {
                        "200": {"description": "Semilla eliminada"},
                        "404": {"description": "Semilla no encontrada"},
                        "403": {"description": "Solo admin"},
                    },
                },
            },
        },
    }


@app.route("/openapi.json", methods=["GET"])
def openapi_json():
    response = jsonify(get_openapi_spec())
    response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
    response.headers["Pragma"] = "no-cache"
    return response


@app.route(f"/{API_PREFIX}/root", methods=["GET"])
def root():
    return jsonify({"message": "Bienvenido a la API de Gea"})


@app.route(f"/{API_PREFIX}/info", methods=["GET"])
def info():
    return jsonify(
        {
            "ok": True,
            "name": "Gea",
            "title": "Tienda de semillas Gea",
            "message": "Informacion general del proyecto GEA",
            "description": "Pagina de venta de semillas con catalogo, carrito, historial de compras y panel de administracion.",
            "version": "1.0.0",
            "api_prefix": API_PREFIX,
            "endpoints": [
                f"/{API_PREFIX}/root",
                f"/{API_PREFIX}/info",
                f"/{API_PREFIX}/signup",
                f"/{API_PREFIX}/login",
                f"/{API_PREFIX}/semillas",
                f"/{API_PREFIX}/checkout",
                f"/{API_PREFIX}/compras",
            ],
            "_links": _api_links(
                {
                    "self": _link("/info", "GET"),
                    "root": _link("/root", "GET"),
                    "home": {"href": _site_url("/index.html"), "method": "GET"},
                    "docs": {"href": _site_url("/docs"), "method": "GET"},
                }
            ),
        }
    )


@app.route("/docs", methods=["GET"])
def docs():
    openapi_spec = json.dumps(get_openapi_spec(), ensure_ascii=False)
    html = "\n".join([
        "<!doctype html>",
        '<html lang="es">',
        "<head>",
        '  <meta charset="utf-8" />',
        "  <title>Gea API Docs</title>",
        '  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist/swagger-ui.css" />',
        "</head>",
        "<body>",
        '  <div id="swagger-ui"></div>',
        '  <script src="https://unpkg.com/swagger-ui-dist/swagger-ui-bundle.js"></script>',
        "  <script>",
        "        function endpointPriority(path) {",
        "            if (path === '/GEA/root') {",
        "                return 0;",
        "            }",
        "            if (path === '/GEA/info') {",
        "                return 1;",
        "            }",
        "            return 2;",
        "        }",
        "",
        "    window.ui = SwaggerUIBundle({",
        f"      spec: {openapi_spec},",
        "      dom_id: '#swagger-ui',",
        "      deepLinking: true,",
        "      presets: [SwaggerUIBundle.presets.apis],",
        "      operationsSorter: (left, right) => {",
        "        const leftPriority = endpointPriority(left.get('path'));",
        "        const rightPriority = endpointPriority(right.get('path'));",
        "        if (leftPriority !== rightPriority) {",
        "          return leftPriority - rightPriority;",
        "        }",
        "        return left.get('path').localeCompare(right.get('path'));",
        "      },",
        "    });",
        "  </script>",
        "</body>",
        "</html>",
    ])

    response = app.response_class(html, mimetype="text/html")
    response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
    response.headers["Pragma"] = "no-cache"
    return response


@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    response.headers["Access-Control-Allow-Methods"] = "GET,POST,PATCH,DELETE,OPTIONS"
    return response


def _to_bool(value):
    if isinstance(value, bool):
        return value
    normalized = str(value or "").strip().lower()
    if normalized in {"1", "true", "si", "sí", "yes"}:
        return True
    if normalized in {"0", "false", "no"}:
        return False
    return None


def _get_admin_user_from_request(data):
    id_user = data.get("id_user")
    if id_user is None:
        return None

    try:
        id_user = int(id_user)
    except (TypeError, ValueError):
        return None

    user = get_user_by_id(id_user)
    if not user or user.get("role") != "admin":
        return None

    return user


@app.route(f"/{API_PREFIX}/signup", methods=["POST", "OPTIONS"])
def signup():
    if request.method == "OPTIONS":
        return ("", 204)

    data = request.get_json(silent=True) or {}
    username = (data.get("nombre") or data.get("username") or "").strip()
    email = (data.get("email") or "").strip()
    password = data.get("password") or ""

    if not username or not email or not password:
        return jsonify({"ok": False, "message": "Completa todos los campos"}), 400

    if len(password) < 6:
        return (
            jsonify(
                {
                    "ok": False,
                    "message": "La contrasena debe tener al menos 6 caracteres",
                }
            ),
            400,
        )

    if get_user_by_email(email) or get_user_by_username(username):
        return jsonify({"ok": False, "message": "Usuario o email ya registrado"}), 409

    user = create_user(username, email, password)
    return (
        jsonify(
            {
                "ok": True,
                "message": "Cuenta creada correctamente",
                "user": {
                    "id": user["id_user"],
                    "id_user": user["id_user"],
                    "nombre": user["username"],
                    "email": user["email"],
                    "role": user["role"],
                },
                "_links": _api_links(
                    {
                        "self": _link("/signup", "POST"),
                        "login": _link("/login", "POST"),
                        "compras": _link(f"/compras?id_user={user['id_user']}", "GET"),
                    }
                ),
            }
        ),
        201,
    )


@app.route(f"/{API_PREFIX}/login", methods=["POST", "OPTIONS"])
def login():
    if request.method == "OPTIONS":
        return ("", 204)

    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip()
    password = data.get("password") or ""

    if not email or not password:
        return jsonify({"ok": False, "message": "Completa email y contrasena"}), 400

    user = get_user_by_email(email)
    if not user or user["password"] != password:
        return jsonify({"ok": False, "message": "Credenciales invalidas"}), 401

    return jsonify(
        {
            "ok": True,
            "message": "Inicio de sesion exitoso",
            "user": {
                "id": user["id_user"],
                "id_user": user["id_user"],
                "nombre": user["username"],
                "email": user["email"],
                "role": user["role"],
            },
            "_links": _api_links(
                {
                    "self": _link("/login", "POST"),
                    "me": _link(f"/compras?id_user={user['id_user']}", "GET"),
                    "checkout": _link("/checkout", "POST"),
                }
            ),
        }
    )


@app.route(f"/{API_PREFIX}/reset-password", methods=["POST", "OPTIONS"])
def reset_password():
    if request.method == "OPTIONS":
        return ("", 204)

    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip()
    password = data.get("password") or ""

    if not email or not password:
        return jsonify({"ok": False, "message": "Completa email y nueva contrasena"}), 400

    if len(password) < 6:
        return jsonify({"ok": False, "message": "La contrasena debe tener al menos 6 caracteres"}), 400

    user = get_user_by_email(email)
    if not user:
        return jsonify({"ok": False, "message": "No existe una cuenta con ese email"}), 404

    updated = update_user_password_by_email(email=email, password=password)
    if not updated:
        return jsonify({"ok": False, "message": "No se pudo actualizar la contrasena"}), 500

    return jsonify(
        {
            "ok": True,
            "message": "Contrasena actualizada correctamente",
            "_links": _api_links(
                {
                    "self": _link("/reset-password", "POST"),
                    "login": _link("/login", "POST"),
                    "info": _link("/info", "GET"),
                }
            ),
        }
    )


@app.route(f"/{API_PREFIX}/semillas", methods=["GET", "OPTIONS"])
def semillas():
    if request.method == "OPTIONS":
        return ("", 204)

    try:
        filtros = {
            "nombre": request.args.get("nombre"),
            "tipo_planta": request.args.get("tipo_planta"),
            "necesidad_luz": request.args.get("necesidad_luz"),
            "riego": request.args.get("riego"),
            "resistencia_frio": request.args.get("resistencia_frio"),
            "estacion_siembra": request.args.get("estacion_siembra"),
            "tiempo_cosecha": request.args.get("tiempo_cosecha"),
            "dificultad": request.args.get("dificultad"),
            "cuidados": request.args.get("cuidados"),
            "produccion": request.args.get("produccion"),
            "invernadero": request.args.get("invernadero"),
            "precio_min": request.args.get("precio_min"),
            "precio_max": request.args.get("precio_max"),
            "sort": request.args.get("sort"),
        }
        catalogo = get_seed_catalog(filtros)
    except Exception:
        return jsonify({"ok": False, "message": "No se pudo cargar el catalogo"}), 500

    return jsonify(
        {
            "ok": True,
            "semillas": catalogo,
            "_links": _api_links(
                {
                    "self": _link("/semillas", "GET"),
                    "checkout": _link("/checkout", "POST"),
                    "compras": _link("/compras", "GET"),
                }
            ),
        }
    )


@app.route(f"/{API_PREFIX}/checkout", methods=["POST", "OPTIONS"])
def checkout():
    if request.method == "OPTIONS":
        return ("", 204)

    data = request.get_json(silent=True) or {}
    id_user = data.get("id_user")
    lineas = data.get("lineas") or []
    total_pedido = data.get("total_pedido")

    if not id_user:
        return jsonify({"ok": False, "message": "Falta id_user"}), 400

    if not isinstance(lineas, list) or len(lineas) == 0:
        return jsonify({"ok": False, "message": "El carrito esta vacio"}), 400

    normalized_lineas = []
    for linea in lineas:
        id_prod = linea.get("id_prod")
        cantidad = int(linea.get("cant") or 0)
        precio_unitario = float(linea.get("precio_unitario") or 0)

        if not id_prod or cantidad <= 0:
            continue

        normalized_lineas.append(
            {
                "id_prod": int(id_prod),
                "cant": cantidad,
                "precio_unitario": precio_unitario,
            }
        )

    if len(normalized_lineas) == 0:
        return jsonify({"ok": False, "message": "No hay lineas validas para comprar"}), 400

    try:
        print("CHECKOUT RECEIVED LINES:", len(normalized_lineas), normalized_lineas)
        total_pedido = round(float(total_pedido), 2)
    except (TypeError, ValueError):
        total_pedido = None

    try:
        compra = create_purchase(
            id_user=int(id_user),
            lineas=normalized_lineas,
            total_pedido=total_pedido,
        )
    except ValueError as error:
        return jsonify({"ok": False, "message": str(error)}), 400
    except Exception:
        return jsonify({"ok": False, "message": "No se pudo guardar el pedido"}), 500

    return jsonify(
        {
            "ok": True,
            "message": "Pedido guardado correctamente",
            "id_compra": compra["id_compra"],
            "id_pedido": compra["id_compra"],
            "total": compra["precio_total"],
            "_links": _api_links(
                {
                    "self": _link("/checkout", "POST"),
                    "compras": _link(f"/compras?id_user={int(id_user)}", "GET"),
                }
            ),
        }
    )


@app.route(f"/{API_PREFIX}/compras", methods=["GET", "OPTIONS"])
def purchases_history():
    if request.method == "OPTIONS":
        return ("", 204)

    id_user_raw = request.args.get("id_user")
    try:
        id_user = int(id_user_raw)
    except (TypeError, ValueError):
        return jsonify({"ok": False, "message": "id_user invalido"}), 400

    if id_user <= 0:
        return jsonify({"ok": False, "message": "id_user invalido"}), 400

    try:
        purchases = get_purchases_by_user(id_user=id_user)
    except ValueError as error:
        return jsonify({"ok": False, "message": str(error)}), 404
    except Exception:
        return jsonify({"ok": False, "message": "No se pudo cargar el historial de compras"}), 500

    enriched_purchases = []
    for purchase in purchases:
        purchase_id = int(purchase["id_compra"])
        enriched_purchases.append(
            {
                **purchase,
                "_links": {
                    "self": _link(f"/compras?id_user={id_user}", "GET"),
                    "repeat": _link(f"/checkout?id_compra={purchase_id}", "POST"),
                },
            }
        )

    return jsonify(
        {
            "ok": True,
            "compras": enriched_purchases,
            "_links": _api_links(
                {
                    "self": _link(f"/compras?id_user={id_user}", "GET"),
                    "checkout": _link("/checkout", "POST"),
                    "semillas": _link("/semillas", "GET"),
                }
            ),
        }
    )


@app.route(f"/{API_PREFIX}/contacto", methods=["POST", "OPTIONS"])
def contacto():
    if request.method == "OPTIONS":
        return ("", 204)

    data = request.get_json(silent=True) or {}

    try:
        id_user = int(data.get("id_user"))
    except (TypeError, ValueError):
        return jsonify({"ok": False, "message": "id_user invalido"}), 400

    if not get_user_by_id(id_user):
        return jsonify({"ok": False, "message": "Usuario no encontrado"}), 404

    nombre = str(data.get("nombre") or "").strip()
    email = str(data.get("email") or "").strip()
    telefono = str(data.get("telefono") or "").strip()
    mensaje = str(data.get("mensaje") or "").strip()

    if not nombre or not email or not mensaje:
        return jsonify({"ok": False, "message": "Completa nombre, email y mensaje"}), 400

    try:
        contacto_guardado = save_contact(
            id_user=id_user,
            nombre=nombre,
            email=email,
            telefono=telefono,
            mensaje=mensaje,
        )
    except Exception as error:
        return jsonify({"ok": False, "message": f"No se pudo guardar el contacto: {error}"}), 500

    return jsonify(
        {
            "ok": True,
            "message": "Contacto guardado correctamente",
            "contacto": contacto_guardado,
        }
    )


@app.route(f"/{API_PREFIX}/admin/productos/<int:id_prod>/stock", methods=["PATCH", "OPTIONS"])
def admin_update_stock(id_prod: int):
    if request.method == "OPTIONS":
        return ("", 204)

    data = request.get_json(silent=True) or {}
    admin_user = _get_admin_user_from_request(data)
    if not admin_user:
        return jsonify({"ok": False, "message": "Solo un admin puede modificar el stock"}), 403

    stock = _to_bool(data.get("stock"))
    if stock is None:
        return jsonify({"ok": False, "message": "El campo stock debe ser true o false"}), 400

    updated = update_product_stock(id_prod=id_prod, stock=stock)
    if not updated:
        return jsonify({"ok": False, "message": "Producto no encontrado"}), 404

    return jsonify(
        {
            "ok": True,
            "message": "Stock actualizado correctamente",
            "producto": updated,
            "_links": _api_links(
                {
                    "self": _link(f"/admin/productos/{id_prod}/stock", "PATCH"),
                    "semillas": _link("/semillas", "GET"),
                }
            ),
        }
    )


@app.route(f"/{API_PREFIX}/admin/productos/<int:id_prod>/precio", methods=["PATCH", "OPTIONS"])
def admin_update_price(id_prod: int):
    if request.method == "OPTIONS":
        return ("", 204)

    data = request.get_json(silent=True) or {}
    admin_user = _get_admin_user_from_request(data)
    if not admin_user:
        return jsonify({"ok": False, "message": "Solo un admin puede modificar el precio"}), 403

    accion = str(data.get("accion") or "").strip().lower()
    if accion not in {"subir", "bajar"}:
        return jsonify({"ok": False, "message": "La accion debe ser subir o bajar"}), 400

    try:
        monto = round(float(data.get("monto")), 2)
    except (TypeError, ValueError):
        return jsonify({"ok": False, "message": "El monto debe ser numerico"}), 400

    if monto <= 0:
        return jsonify({"ok": False, "message": "El monto debe ser mayor que 0"}), 400

    delta = monto if accion == "subir" else -monto

    updated = update_product_price(id_prod=id_prod, delta=delta)
    if not updated:
        return jsonify({"ok": False, "message": "Producto no encontrado"}), 404

    return jsonify(
        {
            "ok": True,
            "message": "Precio actualizado correctamente",
            "producto": updated,
            "_links": _api_links(
                {
                    "self": _link(f"/admin/productos/{id_prod}/precio", "PATCH"),
                    "semillas": _link("/semillas", "GET"),
                }
            ),
        }
    )


@app.route(f"/{API_PREFIX}/admin/productos", methods=["POST", "OPTIONS"])
def admin_create_seed():
    if request.method == "OPTIONS":
        return ("", 204)

    data = request.get_json(silent=True) or {}
    admin_user = _get_admin_user_from_request(data)
    if not admin_user:
        return jsonify({"ok": False, "message": "Solo un admin puede crear semillas"}), 403

    required_fields = [
        "nombre",
        "precio",
        "tipo_planta",
        "necesidad_luz",
        "riego",
        "resistencia_frio",
        "estacion_siembra",
        "tiempo_cosecha",
        "dificultad",
        "cuidados",
        "produccion",
    ]
    missing = [field for field in required_fields if str(data.get(field) or "").strip() == ""]
    if missing:
        return jsonify({"ok": False, "message": f"Faltan campos: {', '.join(missing)}"}), 400

    try:
        data["precio"] = float(data.get("precio"))
    except (TypeError, ValueError):
        return jsonify({"ok": False, "message": "El precio debe ser numerico"}), 400

    invernadero = _to_bool(data.get("invernadero"))
    stock = _to_bool(data.get("stock"))
    if invernadero is None or stock is None:
        return jsonify({"ok": False, "message": "Los campos invernadero y stock son obligatorios y deben ser true/false"}), 400

    data["invernadero"] = invernadero
    data["stock"] = stock

    try:
        created = create_seed_product(data)
    except ValueError as error:
        return jsonify({"ok": False, "message": str(error)}), 400
    except Exception:
        return jsonify({"ok": False, "message": "No se pudo crear la semilla"}), 500

    return jsonify(
        {
            "ok": True,
            "message": "Semilla creada correctamente",
            "semilla": created,
            "_links": _api_links(
                {
                    "self": _link("/admin/productos", "POST"),
                    "semillas": _link("/semillas", "GET"),
                }
            ),
        }
    ), 201


@app.route(f"/{API_PREFIX}/admin/productos", methods=["DELETE", "OPTIONS"])
def admin_delete_seed():
    if request.method == "OPTIONS":
        return ("", 204)

    data = request.get_json(silent=True) or {}
    admin_user = _get_admin_user_from_request(data)
    if not admin_user:
        return jsonify({"ok": False, "message": "Solo un admin puede eliminar semillas"}), 403

    nombre = str(data.get("nombre") or "").strip()
    if not nombre:
        return jsonify({"ok": False, "message": "Debes indicar el nombre de la semilla"}), 400

    try:
        deleted = delete_seed_product_by_name(nombre=nombre)
    except ValueError as error:
        return jsonify({"ok": False, "message": str(error)}), 400
    except Exception:
        return jsonify({"ok": False, "message": "No se pudo eliminar la semilla"}), 500

    if not deleted:
        return jsonify({"ok": False, "message": "Semilla no encontrada"}), 404

    return jsonify(
        {
            "ok": True,
            "message": "Semilla eliminada correctamente",
            "id": deleted["id"],
            "nombre": deleted["nombre"],
            "_links": _api_links(
                {
                    "self": _link("/admin/productos", "DELETE"),
                    "semillas": _link("/semillas", "GET"),
                }
            ),
        }
    )


if __name__ == "__main__":
    init_db()
    app.run(host=API_HOST, port=API_PORT, debug=False)
