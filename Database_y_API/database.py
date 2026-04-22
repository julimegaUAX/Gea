import argparse
import json
import os
from pathlib import Path
import unicodedata

import psycopg2
from dotenv import load_dotenv
from psycopg2.extras import RealDictCursor


def get_db_connection():
    load_dotenv()
    dbhost = os.getenv("DB_HOST") or os.getenv("dbhost") or "localhost"
    dbport = os.getenv("DB_PORT") or os.getenv("dbport") or "5432"
    dbname = os.getenv("DB_NAME") or os.getenv("dbname") or "GEA"
    dbuser = os.getenv("DB_USER") or os.getenv("dbuser")
    dbpass = os.getenv("DB_PASS") or os.getenv("dbpass")

    conn = psycopg2.connect(
        database=dbname,
        user=dbuser,
        password=dbpass,
        host=dbhost,
        port=dbport,
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
            password VARCHAR(255) NOT NULL,
            role VARCHAR(16) NOT NULL DEFAULT 'user'
        )
        """
    )

    cursor.execute(
        """
        ALTER TABLE users
        ADD COLUMN IF NOT EXISTS role VARCHAR(16) NOT NULL DEFAULT 'user'
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
        ALTER TABLE prod
        ADD COLUMN IF NOT EXISTS precio NUMERIC(10, 2),
        ADD COLUMN IF NOT EXISTS tipo_planta VARCHAR(16),
        ADD COLUMN IF NOT EXISTS necesidad_luz VARCHAR(32),
        ADD COLUMN IF NOT EXISTS riego VARCHAR(32),
        ADD COLUMN IF NOT EXISTS resistencia_frio VARCHAR(32),
        ADD COLUMN IF NOT EXISTS estacion_siembra VARCHAR(32),
        ADD COLUMN IF NOT EXISTS tiempo_cosecha VARCHAR(64),
        ADD COLUMN IF NOT EXISTS dificultad VARCHAR(32),
        ADD COLUMN IF NOT EXISTS cuidados VARCHAR(32),
        ADD COLUMN IF NOT EXISTS produccion VARCHAR(32),
        ADD COLUMN IF NOT EXISTS invernadero BOOLEAN NOT NULL DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS stock BOOLEAN NOT NULL DEFAULT TRUE
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

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS contactos (
            id_contacto SERIAL PRIMARY KEY,
            id_user INTEGER NOT NULL REFERENCES users(id_user) ON DELETE CASCADE,
            nombre VARCHAR(100) NOT NULL,
            email VARCHAR(255) NOT NULL,
            telefono VARCHAR(32),
            mensaje TEXT NOT NULL
        )
        """
    )

    cursor.execute(
        """
        DO $$
        BEGIN
            IF to_regclass('public.contactos') IS NOT NULL THEN
                IF NOT EXISTS (
                    SELECT 1
                    FROM information_schema.columns
                    WHERE table_schema='public' AND table_name='contactos' AND column_name='id_contacto'
                ) THEN
                    ALTER TABLE contactos ADD COLUMN id_contacto SERIAL;
                END IF;

                IF EXISTS (
                    SELECT 1
                    FROM information_schema.columns
                    WHERE table_schema='public' AND table_name='contactos' AND column_name='id_user'
                ) THEN
                    ALTER TABLE contactos ALTER COLUMN id_user SET NOT NULL;
                END IF;

                IF EXISTS (
                    SELECT 1
                    FROM pg_constraint
                    WHERE conname='contactos_pkey'
                ) THEN
                    ALTER TABLE contactos DROP CONSTRAINT contactos_pkey;
                END IF;

                IF NOT EXISTS (
                    SELECT 1
                    FROM pg_constraint
                    WHERE conname='contactos_pkey'
                ) THEN
                    ALTER TABLE contactos ADD CONSTRAINT contactos_pkey PRIMARY KEY (id_contacto);
                END IF;
            END IF;
        END $$;
        """
    )

    cursor.execute(
        """
        ALTER TABLE contactos
        DROP COLUMN IF EXISTS created_at,
        DROP COLUMN IF EXISTS updated_at
        """
    )

    cursor.execute(
        """
        DO $$
        BEGIN
            IF to_regclass('public."Contacto"') IS NOT NULL THEN
                INSERT INTO contactos (id_user, nombre, email, telefono, mensaje)
                SELECT id_user, nombre, email, telefono, mensaje
                FROM "Contacto"
                ;

                DROP TABLE "Contacto";
            END IF;
        END $$;
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
            INSERT INTO prod (
                id_prod,
                nombre,
                id_cat,
                precio,
                tipo_planta,
                necesidad_luz,
                riego,
                resistencia_frio,
                estacion_siembra,
                tiempo_cosecha,
                dificultad,
                cuidados,
                produccion,
                invernadero,
                stock
            )
            VALUES (
                %(id_prod)s,
                %(nombre)s,
                %(id_cat)s,
                %(precio)s,
                %(tipo_planta)s,
                %(necesidad_luz)s,
                %(riego)s,
                %(resistencia_frio)s,
                %(estacion_siembra)s,
                %(tiempo_cosecha)s,
                %(dificultad)s,
                %(cuidados)s,
                %(produccion)s,
                %(invernadero)s,
                %(stock)s
            )
            ON CONFLICT (id_prod)
            DO UPDATE SET
                nombre = EXCLUDED.nombre,
                id_cat = EXCLUDED.id_cat,
                precio = EXCLUDED.precio,
                tipo_planta = EXCLUDED.tipo_planta,
                necesidad_luz = EXCLUDED.necesidad_luz,
                riego = EXCLUDED.riego,
                resistencia_frio = EXCLUDED.resistencia_frio,
                estacion_siembra = EXCLUDED.estacion_siembra,
                tiempo_cosecha = EXCLUDED.tiempo_cosecha,
                dificultad = EXCLUDED.dificultad,
                cuidados = EXCLUDED.cuidados,
                produccion = EXCLUDED.produccion,
                invernadero = EXCLUDED.invernadero,
                stock = EXCLUDED.stock
            """,
            {
                "id_prod": int(semilla["id"]),
                "nombre": semilla["nombre"],
                "id_cat": id_cat,
                "precio": float(semilla.get("precio") or 0),
                "tipo_planta": semilla.get("tipo_planta"),
                "necesidad_luz": semilla.get("necesidad_luz"),
                "riego": semilla.get("riego"),
                "resistencia_frio": semilla.get("resistencia_frio"),
                "estacion_siembra": semilla.get("estacion_siembra"),
                "tiempo_cosecha": semilla.get("tiempo_cosecha"),
                "dificultad": semilla.get("dificultad"),
                "cuidados": semilla.get("cuidados"),
                "produccion": semilla.get("produccion"),
                "invernadero": bool(semilla.get("invernadero")),
                "stock": bool(semilla.get("stock", True)),
            },
        )


def _normalize_text(value):
    text = unicodedata.normalize("NFD", str(value or "").lower())
    return "".join(char for char in text if not unicodedata.combining(char))


def _parse_bool_filter(value):
    if value is None:
        return None
    normalized = str(value).strip().lower()
    if normalized in {"1", "true", "si", "sí", "yes"}:
        return True
    if normalized in {"0", "false", "no"}:
        return False
    return None


def get_seed_catalog(filters=None):
    filters = filters or {}
    conn = get_db_connection()
    cursor = get_db_cursor(conn)
    cursor.execute(
        """
        SELECT
            id_prod AS id,
            id_cat,
            nombre,
            precio,
            tipo_planta,
            necesidad_luz,
            riego,
            resistencia_frio,
            estacion_siembra,
            tiempo_cosecha,
            dificultad,
            cuidados,
            produccion,
            invernadero,
            stock
        FROM prod
        ORDER BY id_prod ASC
        """
    )
    rows = cursor.fetchall()
    conexclose(conn, cursor)

    search_text = _normalize_text(filters.get("nombre"))
    min_price = filters.get("precio_min")
    max_price = filters.get("precio_max")
    tipo_planta = filters.get("tipo_planta")
    necesidad_luz = filters.get("necesidad_luz")
    riego = filters.get("riego")
    resistencia_frio = filters.get("resistencia_frio")
    estacion_siembra = filters.get("estacion_siembra")
    tiempo_cosecha = filters.get("tiempo_cosecha")
    dificultad = filters.get("dificultad")
    cuidados = filters.get("cuidados")
    produccion = filters.get("produccion")
    invernadero = _parse_bool_filter(filters.get("invernadero"))
    sort_mode = filters.get("sort") or "relevancia"

    def matches_search(row):
        if not search_text:
            return True

        tokens = [token for token in search_text.split() if token]
        searchable_text = _normalize_text(row.get("nombre"))

        return all(token in searchable_text for token in tokens)

    filtered_rows = []
    for row in rows:
        if tipo_planta and _normalize_text(row.get("tipo_planta")) != _normalize_text(tipo_planta):
            continue
        if necesidad_luz and _normalize_text(row.get("necesidad_luz")) != _normalize_text(necesidad_luz):
            continue
        if riego and _normalize_text(row.get("riego")) != _normalize_text(riego):
            continue
        if resistencia_frio and _normalize_text(row.get("resistencia_frio")) != _normalize_text(resistencia_frio):
            continue
        if estacion_siembra and _normalize_text(row.get("estacion_siembra")) != _normalize_text(estacion_siembra):
            continue
        if tiempo_cosecha and _normalize_text(row.get("tiempo_cosecha")) != _normalize_text(tiempo_cosecha):
            continue
        if dificultad and _normalize_text(row.get("dificultad")) != _normalize_text(dificultad):
            continue
        if cuidados and _normalize_text(row.get("cuidados")) != _normalize_text(cuidados):
            continue
        if produccion and _normalize_text(row.get("produccion")) != _normalize_text(produccion):
            continue

        precio_value = float(row.get("precio") or 0)
        if min_price is not None and precio_value < float(min_price):
            continue
        if max_price is not None and precio_value > float(max_price):
            continue

        if invernadero is not None and bool(row.get("invernadero")) != invernadero:
            continue

        if not matches_search(row):
            continue

        filtered_rows.append(row)

    if sort_mode == "nombre-asc":
        filtered_rows.sort(key=lambda item: _normalize_text(item.get("nombre")))
    elif sort_mode == "nombre-desc":
        filtered_rows.sort(key=lambda item: _normalize_text(item.get("nombre")), reverse=True)
    elif sort_mode == "precio-asc":
        filtered_rows.sort(key=lambda item: float(item.get("precio") or 0))
    elif sort_mode == "precio-desc":
        filtered_rows.sort(key=lambda item: float(item.get("precio") or 0), reverse=True)

    return filtered_rows


def get_user_by_email(email: str):
    conn = get_db_connection()
    cursor = get_db_cursor(conn)
    cursor.execute(
        """
        SELECT id_user, username, email, password, role
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
        SELECT id_user, username, email, password, role
        FROM users
        WHERE username = %(username)s
        """,
        {"username": username},
    )
    row = cursor.fetchone()
    conexclose(conn, cursor)
    return row


def get_user_by_id(id_user: int):
    conn = get_db_connection()
    cursor = get_db_cursor(conn)
    cursor.execute(
        """
        SELECT id_user, username, email, role
        FROM users
        WHERE id_user = %(id_user)s
        """,
        {"id_user": id_user},
    )
    row = cursor.fetchone()
    conexclose(conn, cursor)
    return row


def create_user(username: str, email: str, password: str):
    conn = get_db_connection()
    cursor = get_db_cursor(conn)

    cursor.execute("SELECT COUNT(*) AS total_admins FROM users WHERE role = 'admin'")
    admins = cursor.fetchone()
    role = "admin" if int(admins["total_admins"] or 0) == 0 else "user"

    cursor.execute(
        """
        INSERT INTO users (username, email, password, role)
        VALUES (%(username)s, %(email)s, %(password)s, %(role)s)
        RETURNING id_user, username, email, role
        """,
        {
            "username": username,
            "email": email,
            "password": password,
            "role": role,
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


def save_contact(id_user: int, nombre: str, email: str, telefono: str, mensaje: str):
    conn = get_db_connection()
    cursor = get_db_cursor(conn)
    cursor.execute(
        """
        INSERT INTO contactos (id_user, nombre, email, telefono, mensaje)
        VALUES (%(id_user)s, %(nombre)s, %(email)s, %(telefono)s, %(mensaje)s)
        RETURNING id_contacto, id_user, nombre, email, telefono, mensaje
        """,
        {
            "id_user": int(id_user),
            "nombre": nombre,
            "email": email,
            "telefono": telefono,
            "mensaje": mensaje,
        },
    )
    saved = cursor.fetchone()
    conn.commit()
    conexclose(conn, cursor)
    return saved


def update_product_stock(id_prod: int, stock: bool):
    conn = get_db_connection()
    cursor = get_db_cursor(conn)
    cursor.execute(
        """
        UPDATE prod
        SET stock = %(stock)s
        WHERE id_prod = %(id_prod)s
        RETURNING id_prod AS id, stock
        """,
        {
            "id_prod": id_prod,
            "stock": stock,
        },
    )
    updated = cursor.fetchone()
    conn.commit()
    conexclose(conn, cursor)
    return updated


def update_product_price(id_prod: int, delta: float):
    conn = get_db_connection()
    cursor = get_db_cursor(conn)
    cursor.execute(
        """
        UPDATE prod
        SET precio = GREATEST(0, ROUND((COALESCE(precio, 0) + %(delta)s)::numeric, 2))
        WHERE id_prod = %(id_prod)s
        RETURNING id_prod AS id, nombre, precio
        """,
        {
            "id_prod": id_prod,
            "delta": float(delta),
        },
    )
    updated = cursor.fetchone()
    conn.commit()
    conexclose(conn, cursor)
    return updated


def create_seed_product(seed_data: dict):
    conn = get_db_connection()
    cursor = get_db_cursor(conn)

    category_map = {
        "herb": "Hierbas aromaticas",
        "veg": "Vegetales",
        "leg": "Legumbres",
        "cer": "Cereales",
        "flo": "Flores",
        "fru": "Frutas",
    }

    tipo_planta = str(seed_data.get("tipo_planta") or "").strip().lower()
    nombre_cat = category_map.get(tipo_planta)
    if not nombre_cat:
        conexclose(conn, cursor)
        raise ValueError("tipo_planta invalido")

    cursor.execute(
        "SELECT id_cat FROM cat WHERE nombre_cat = %(nombre_cat)s",
        {"nombre_cat": nombre_cat},
    )
    cat_row = cursor.fetchone()
    if not cat_row:
        conexclose(conn, cursor)
        raise ValueError("Categoria no encontrada")

    cursor.execute("SELECT COALESCE(MAX(id_prod), 0) + 1 AS next_id FROM prod")
    next_id_row = cursor.fetchone()
    next_id = int(next_id_row["next_id"])

    cursor.execute(
        """
        INSERT INTO prod (
            id_prod,
            nombre,
            id_cat,
            precio,
            tipo_planta,
            necesidad_luz,
            riego,
            resistencia_frio,
            estacion_siembra,
            tiempo_cosecha,
            dificultad,
            cuidados,
            produccion,
            invernadero,
            stock
        )
        VALUES (
            %(id_prod)s,
            %(nombre)s,
            %(id_cat)s,
            %(precio)s,
            %(tipo_planta)s,
            %(necesidad_luz)s,
            %(riego)s,
            %(resistencia_frio)s,
            %(estacion_siembra)s,
            %(tiempo_cosecha)s,
            %(dificultad)s,
            %(cuidados)s,
            %(produccion)s,
            %(invernadero)s,
            %(stock)s
        )
        RETURNING
            id_prod AS id,
            id_cat,
            nombre,
            precio,
            tipo_planta,
            necesidad_luz,
            riego,
            resistencia_frio,
            estacion_siembra,
            tiempo_cosecha,
            dificultad,
            cuidados,
            produccion,
            invernadero,
            stock
        """,
        {
            "id_prod": next_id,
            "nombre": str(seed_data.get("nombre") or "").strip(),
            "id_cat": int(cat_row["id_cat"]),
            "precio": float(seed_data.get("precio") or 0),
            "tipo_planta": tipo_planta,
            "necesidad_luz": str(seed_data.get("necesidad_luz") or "").strip().lower(),
            "riego": str(seed_data.get("riego") or "").strip().lower(),
            "resistencia_frio": str(seed_data.get("resistencia_frio") or "").strip().lower(),
            "estacion_siembra": str(seed_data.get("estacion_siembra") or "").strip().lower(),
            "tiempo_cosecha": str(seed_data.get("tiempo_cosecha") or "").strip(),
            "dificultad": str(seed_data.get("dificultad") or "").strip().lower(),
            "cuidados": str(seed_data.get("cuidados") or "").strip().lower(),
            "produccion": str(seed_data.get("produccion") or "").strip().lower(),
            "invernadero": bool(seed_data.get("invernadero", False)),
            "stock": bool(seed_data.get("stock", True)),
        },
    )
    created = cursor.fetchone()
    conn.commit()
    conexclose(conn, cursor)
    return created


def delete_seed_product_by_name(nombre: str):
    normalized_name = str(nombre or "").strip()
    if not normalized_name:
        raise ValueError("El nombre de la semilla es obligatorio")

    conn = get_db_connection()
    cursor = get_db_cursor(conn)
    cursor.execute(
        """
        DELETE FROM prod
        WHERE id_prod = (
            SELECT id_prod
            FROM prod
            WHERE LOWER(TRIM(nombre)) = LOWER(TRIM(%(nombre)s))
            ORDER BY id_prod ASC
            LIMIT 1
        )
        RETURNING id_prod AS id, nombre
        """,
        {"nombre": normalized_name},
    )
    deleted = cursor.fetchone()
    conn.commit()
    conexclose(conn, cursor)
    return deleted


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
            "SELECT id_cat, stock FROM prod WHERE id_prod = %(id_prod)s",
            {"id_prod": id_prod},
        )
        prod = cursor.fetchone()
        if not prod:
            conexclose(conn, cursor)
            raise ValueError("Producto no existe")

        if not bool(prod.get("stock")):
            conexclose(conn, cursor)
            raise ValueError("Producto sin existencias")

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


def get_purchases_by_user(id_user: int):
    conn = get_db_connection()
    cursor = get_db_cursor(conn)

    cursor.execute("SELECT id_user FROM users WHERE id_user = %(id_user)s", {"id_user": id_user})
    user = cursor.fetchone()
    if not user:
        conexclose(conn, cursor)
        raise ValueError("Usuario no existe")

    cursor.execute(
        """
        SELECT id_compra, precio_total
        FROM compras
        WHERE id_user = %(id_user)s
        ORDER BY id_compra ASC
        """,
        {"id_user": id_user},
    )
    compras_rows = cursor.fetchall()

    purchases = []
    for compra in compras_rows:
        id_compra = int(compra["id_compra"])
        cursor.execute(
            """
            SELECT
                cl.id_prod,
                p.nombre,
                cl.cant,
                cl.precio
            FROM compras_lineas cl
            JOIN prod p ON p.id_prod = cl.id_prod
            WHERE cl.id_compra = %(id_compra)s
            ORDER BY cl.id_compra_linea ASC
            """,
            {"id_compra": id_compra},
        )
        lineas_rows = cursor.fetchall()

        lineas = []
        for row in lineas_rows:
            lineas.append(
                {
                    "id_prod": int(row["id_prod"]),
                    "nombre": row["nombre"],
                    "cant": int(row["cant"]),
                    "subtotal": round(float(row["precio"]), 2),
                }
            )

        purchases.append(
            {
                "id_compra": id_compra,
                "total": round(float(compra["precio_total"]), 2),
                "lineas": lineas,
            }
        )

    conexclose(conn, cursor)
    return purchases


if __name__ == "__main__":
    fileparser = argparse.ArgumentParser()
    fileparser.add_argument("--initdb", help="Initialize users table", action="store_true")
    fileargs = fileparser.parse_args()

    if fileargs.initdb:
        init_db()
        print("Database initialized")
