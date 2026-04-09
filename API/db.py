import argparse
import os

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
            id SERIAL PRIMARY KEY,
            username VARCHAR(100) NOT NULL UNIQUE,
            email VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255)
        )
        """
    )

    cursor.execute(
        """
        ALTER TABLE users
        ADD COLUMN IF NOT EXISTS password VARCHAR(255)
        """
    )

    cursor.execute(
        """
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1
                FROM information_schema.columns
                WHERE table_name='users' AND column_name='password_hash'
            ) THEN
                UPDATE users
                SET password = COALESCE(password, password_hash)
                WHERE password IS NULL;
            END IF;
        END $$;
        """
    )

    cursor.execute(
        """
        ALTER TABLE users
        ALTER COLUMN password SET NOT NULL
        """
    )

    cursor.execute(
        """
        ALTER TABLE users
        DROP COLUMN IF EXISTS password_hash
        """
    )

    conn.commit()
    conexclose(conn, cursor)


def get_user_by_email(email: str):
    conn = get_db_connection()
    cursor = get_db_cursor(conn)
    cursor.execute(
        """
        SELECT id, username, email, password
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
        SELECT id, username, email, password
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
        RETURNING id, username, email
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


if __name__ == "__main__":
    fileparser = argparse.ArgumentParser()
    fileparser.add_argument("--initdb", help="Initialize users table", action="store_true")
    fileargs = fileparser.parse_args()

    if fileargs.initdb:
        init_db()
        print("Database initialized")
