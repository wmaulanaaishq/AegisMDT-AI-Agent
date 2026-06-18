import sqlite3
import json
import logging
from pathlib import Path
from models import PatientCase

logger = logging.getLogger(__name__)

DB_PATH = Path("aegismdt.db")

def init_db():
    """Initialize the SQLite database and create tables if they don't exist."""
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS cases (
            id TEXT PRIMARY KEY,
            data TEXT NOT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()
    logger.info(f"Database initialized at {DB_PATH.absolute()}")

def save_case(case: PatientCase):
    """Save or update a PatientCase in the database."""
    case.updated_at = case.updated_at # update time happens at object level
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute(
        'INSERT OR REPLACE INTO cases (id, data) VALUES (?, ?)',
        (case.id, case.model_dump_json())
    )
    conn.commit()
    conn.close()

def get_case(case_id: str) -> PatientCase | None:
    """Retrieve a PatientCase from the database."""
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('SELECT data FROM cases WHERE id = ?', (case_id,))
    row = c.fetchone()
    conn.close()
    
    if row:
        try:
            return PatientCase.model_validate_json(row[0])
        except Exception as e:
            logger.error(f"Failed to parse case {case_id}: {e}")
            return None
    return None

def get_all_cases() -> list[PatientCase]:
    """Retrieve all PatientCases from the database."""
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('SELECT data FROM cases ORDER BY updated_at DESC')
    rows = c.fetchall()
    conn.close()
    
    cases = []
    for row in rows:
        try:
            cases.append(PatientCase.model_validate_json(row[0]))
        except Exception as e:
            logger.error(f"Failed to parse a case from DB: {e}")
    
    # Sort by created_at descending just to be safe
    cases.sort(key=lambda x: x.created_at, reverse=True)
    return cases
