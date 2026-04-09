from flask import Flask, jsonify, request

from db import create_user, get_user_by_email, get_user_by_username, init_db

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
                "id": user["id"],
                "nombre": user["username"],
                "email": user["email"],
            },
        }
    )


if __name__ == "__main__":
    init_db()
    app.run(debug=True)
