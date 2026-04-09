import argparse
import json
import os
from pathlib import Path

import psycopg2
from dotenv import load_dotenv
from psycopg2.extras import RealDictCursor


def get_db_connection():
    load_dotenv()
    dbuser = os.getenv("dbuser")
    dbpass = os.getenv("dbpass")

    conn = psycopg2.connect(
        database="GEA",
        user=dbuser,
        password=dbpass,
        host="localhost",
    )
    return conn


def get_db_cursor(conn):
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    return cursor


def conexclose(conn, cursor):
    cursor.close()
    conn.close()


def init_db():
    conn = get_db_connection()
    cursor = get_db_cursor(conn)

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            id_user SERIAL PRIMARY KEY,
            username VARCHAR(100) NOT NULL UNIQUE,
            email VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL
        )
        """
    )

    cursor.execute(
        """
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1
                FROM information_schema.columns
                WHERE table_name='users' AND column_name='id'
            )
            AND NOT EXISTS (
                SELECT 1
                FROM information_schema.columns
                WHERE table_name='users' AND column_name='id_user'
            ) THEN
                ALTER TABLE users RENAME COLUMN id TO id_user;
            END IF;

            IF EXISTS (
                SELECT 1
                FROM information_schema.columns
                WHERE table_name='users' AND column_name='password_hash'
            )
            AND NOT EXISTS (
                SELECT 1
                FROM information_schema.columns
                WHERE table_name='users' AND column_name='password'
            ) THEN
                ALTER TABLE users ADD COLUMN password VARCHAR(255);
            END IF;

            IF EXISTS (
                SELECT 1
                FROM information_schema.columns
                WHERE table_name='users' AND column_name='password_hash'
            ) THEN
                UPDATE users
                SET password = COALESCE(password, password_hash)
                WHERE password IS NULL;
                ALTER TABLE users DROP COLUMN password_hash;
            END IF;
        END $$;
        """
    )

    cursor.execute(
        """
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1
                FROM pg_indexes
                WHERE tablename='users' AND indexname='users_username_uq'
            ) THEN
                CREATE UNIQUE INDEX users_username_uq ON users(username);
            END IF;

            IF NOT EXISTS (
                SELECT 1
                FROM pg_indexes
                WHERE tablename='users' AND indexname='users_email_uq'
            ) THEN
                CREATE UNIQUE INDEX users_email_uq ON users(email);
            END IF;
        END $$;
        """
    )

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS cat (
            id_cat SERIAL PRIMARY KEY,
            nombre_cat VARCHAR(120) NOT NULL UNIQUE
        )
        """
    )

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS prod (
            id_prod INTEGER PRIMARY KEY,
            nombre VARCHAR(255) NOT NULL,
            id_cat INTEGER NOT NULL REFERENCES cat(id_cat)
        )
        """
    )

    cursor.execute(
        """
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1
                FROM information_schema.columns
                WHERE table_name='compras' AND column_name='id_pedido'
            ) THEN
                DROP TABLE IF EXISTS compras_lineas;
                DROP TABLE IF EXISTS compras;
            END IF;
        END $$;
        """
    )

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS compras (
            id_compra SERIAL PRIMARY KEY,
            id_user INTEGER NOT NULL REFERENCES users(id_user),
            precio_total NUMERIC(10, 2) NOT NULL DEFAULT 0
        )
        """
    )

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS compras_lineas (
            id_compra_linea SERIAL PRIMARY KEY,
            id_compra INTEGER NOT NULL REFERENCES compras(id_compra) ON DELETE CASCADE,
            id_prod INTEGER NOT NULL REFERENCES prod(id_prod),
            id_cat INTEGER NOT NULL REFERENCES cat(id_cat),
            cant INTEGER NOT NULL,
            precio NUMERIC(10, 2) NOT NULL
        )
        """
    )

    _seed_catalog_data(cursor)

    conn.commit()
    conexclose(conn, cursor)


def _seed_catalog_data(cursor):
    semillas_path = Path(__file__).resolve().parent.parent / "data" / "semillas.json"
    if not semillas_path.exists():
        return

    with semillas_path.open("r", encoding="utf-8") as file:
        semillas = json.load(file)

    category_map = {
        "herb": "Hierbas aromaticas",
        "veg": "Vegetales",
        "leg": "Legumbres",
        "cer": "Cereales",
        "flo": "Flores",
        "fru": "Frutas",
    }

    for nombre_cat in category_map.values():
        cursor.execute(
            """
            INSERT INTO cat (nombre_cat)
            VALUES (%(nombre_cat)s)
            ON CONFLICT (nombre_cat) DO NOTHING
            """,
            {"nombre_cat": nombre_cat},
        )

    cursor.execute("SELECT id_cat, nombre_cat FROM cat")
    rows = cursor.fetchall()
    category_ids = {row["nombre_cat"]: row["id_cat"] for row in rows}

    for semilla in semillas:
        tipo_planta = semilla.get("tipo_planta")
        nombre_cat = category_map.get(tipo_planta)
        if not nombre_cat:
            continue

        id_cat = category_ids.get(nombre_cat)
        if not id_cat:
            continue

        cursor.execute(
            """
            INSERT INTO prod (id_prod, nombre, id_cat)
            VALUES (%(id_prod)s, %(nombre)s, %(id_cat)s)
            ON CONFLICT (id_prod)
            DO UPDATE SET nombre = EXCLUDED.nombre, id_cat = EXCLUDED.id_cat
            """,
            {
                "id_prod": int(semilla["id"]),
                "nombre": semilla["nombre"],
                "id_cat": id_cat,
            },
        )


def get_user_by_email(email: str):
    conn = get_db_connection()
    cursor = get_db_cursor(conn)
    cursor.execute(
        """
        SELECT id_user, username, email, password
        FROM users
        WHERE email = %(email)s
        """,
        {"email": email},
    )
    row = cursor.fetchone()
    conexclose(conn, cursor)
    return row


def get_user_by_username(username: str):
    conn = get_db_connection()
    cursor = get_db_cursor(conn)
    cursor.execute(
        """
        SELECT id_user, username, email, password
        FROM users
        WHERE username = %(username)s
        """,
        {"username": username},
    )
    row = cursor.fetchone()
    conexclose(conn, cursor)
    return row


def create_user(username: str, email: str, password: str):
    conn = get_db_connection()
    cursor = get_db_cursor(conn)
    cursor.execute(
        """
        INSERT INTO users (username, email, password)
        VALUES (%(username)s, %(email)s, %(password)s)
        RETURNING id_user, username, email
        """,
        {
            "username": username,
            "email": email,
            "password": password,
        },
    )
    user = cursor.fetchone()
    conn.commit()
    conexclose(conn, cursor)
    return user


def update_user_password_by_email(email: str, password: str):
    conn = get_db_connection()
    cursor = get_db_cursor(conn)
    cursor.execute(
        """
        UPDATE users
        SET password = %(password)s
        WHERE email = %(email)s
        """,
        {"email": email, "password": password},
    )
    updated = cursor.rowcount
    conn.commit()
    conexclose(conn, cursor)
    return updated > 0


def create_purchase(
    id_user: int,
    lineas: list,
    total_pedido: float | None = None,
):
    conn = get_db_connection()
    cursor = get_db_cursor(conn)

    cursor.execute("SELECT id_user FROM users WHERE id_user = %(id_user)s", {"id_user": id_user})
    user = cursor.fetchone()
    if not user:
        conexclose(conn, cursor)
        raise ValueError("Usuario no existe")

    cursor.execute(
        """
        INSERT INTO compras (id_user, precio_total)
        VALUES (%(id_user)s, 0)
        RETURNING id_compra
        """,
        {"id_user": id_user},
    )
    compra = cursor.fetchone()
    id_compra = compra["id_compra"]
    total = 0.0

    for linea in lineas:
        id_prod = int(linea["id_prod"])
        cant = int(linea["cant"])
        precio_unitario = float(linea["precio_unitario"])

        if cant <= 0:
            continue

        cursor.execute(
            "SELECT id_cat FROM prod WHERE id_prod = %(id_prod)s",
            {"id_prod": id_prod},
        )
        prod = cursor.fetchone()
        if not prod:
            conexclose(conn, cursor)
            raise ValueError("Producto no existe")

        id_cat = prod["id_cat"]
        subtotal = round(precio_unitario * cant, 2)
        total += subtotal

        cursor.execute(
            """
            INSERT INTO compras_lineas (id_compra, id_prod, id_cat, cant, precio)
            VALUES (%(id_compra)s, %(id_prod)s, %(id_cat)s, %(cant)s, %(precio)s)
            """,
            {
                "id_compra": id_compra,
                "id_prod": id_prod,
                "id_cat": id_cat,
                "cant": cant,
                "precio": subtotal,
            },
        )

    if total <= 0:
        conn.rollback()
        conexclose(conn, cursor)
        raise ValueError("No hay lineas validas para guardar")

    if total_pedido is None:
        total_pedido = round(total, 2)

    cursor.execute(
        """
        UPDATE compras
        SET precio_total = %(precio_total)s
        WHERE id_compra = %(id_compra)s
        """,
        {
            "precio_total": round(float(total_pedido), 2),
            "id_compra": id_compra,
        },
    )

    conn.commit()
    conexclose(conn, cursor)
    return {"id_compra": id_compra, "precio_total": round(float(total_pedido), 2)}


if __name__ == "__main__":
    fileparser = argparse.ArgumentParser()
    fileparser.add_argument("--initdb", help="Initialize users table", action="store_true")
    fileargs = fileparser.parse_args()

    if fileargs.initdb:
        init_db()
        print("Database initialized")
