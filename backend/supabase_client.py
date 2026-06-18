import psycopg2
import json
import logging
from typing import List, Optional
from urllib.parse import quote_plus
from models import PatientCase

logger = logging.getLogger(__name__)

# URL encode the password since it contains special characters like *
DB_PASSWORD = quote_plus("*Abimanyu123")
DB_URL = f"postgresql://postgres:{DB_PASSWORD}@db.ebytxsgedqrlwwxbdygr.supabase.co:5432/postgres"

def get_connection():
    return psycopg2.connect(DB_URL)

def init_db():
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute('''
            CREATE TABLE IF NOT EXISTS cases (
                id TEXT PRIMARY KEY,
                data JSONB NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        conn.commit()
        cur.close()
        conn.close()
        logger.info("Supabase PostgreSQL initialized successfully.")
    except Exception as e:
        logger.error(f"Failed to initialize Supabase: {e}")

def save_case(case: PatientCase):
    try:
        conn = get_connection()
        cur = conn.cursor()
        # Postgres UPSERT
        cur.execute('''
            INSERT INTO cases (id, data, updated_at) 
            VALUES (%s, %s, CURRENT_TIMESTAMP)
            ON CONFLICT (id) DO UPDATE SET 
                data = EXCLUDED.data,
                updated_at = CURRENT_TIMESTAMP
        ''', (case.id, case.model_dump_json()))
        conn.commit()
        cur.close()
        conn.close()
    except Exception as e:
        logger.error(f"Failed to save case to Supabase: {e}")

def get_case(case_id: str) -> Optional[PatientCase]:
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute('SELECT data FROM cases WHERE id = %s', (case_id,))
        row = cur.fetchone()
        cur.close()
        conn.close()
        
        if row and row[0]:
            # row[0] might be a dict (JSONB automatically parsed by psycopg2) or string
            data = row[0] if isinstance(row[0], str) else json.dumps(row[0])
            return PatientCase.model_validate_json(data)
    except Exception as e:
        logger.error(f"Failed to get case from Supabase: {e}")
    return None

def get_all_cases() -> List[PatientCase]:
    cases = []
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute('SELECT data FROM cases ORDER BY updated_at DESC')
        rows = cur.fetchall()
        cur.close()
        conn.close()
        
        for row in rows:
            data = row[0] if isinstance(row[0], str) else json.dumps(row[0])
            cases.append(PatientCase.model_validate_json(data))
    except Exception as e:
        logger.error(f"Failed to list cases from Supabase: {e}")
    return cases
