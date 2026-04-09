from flask import Flask, jsonify, request

from database import create_purchase, create_user, get_user_by_email, get_user_by_username, init_db

app = Flask(__name__)


@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    response.headers["Access-Control-Allow-Methods"] = "GET,POST,OPTIONS"
    return response


@app.route("/api/signup", methods=["POST", "OPTIONS"])
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
                "user": user,
            }
        ),
        201,
    )


@app.route("/api/login", methods=["POST", "OPTIONS"])
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
            },
        }
    )


@app.route("/api/checkout", methods=["POST", "OPTIONS"])
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
        }
    )


if __name__ == "__main__":
    init_db()
    app.run(debug=False)
