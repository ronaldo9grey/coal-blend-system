import sqlite3
import json
from datetime import datetime
from typing import List, Optional
from contextlib import contextmanager

DB_PATH = "coal_blend.db"

@contextmanager
def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()

def init_db():
    with get_db() as conn:
        conn.execute('''
            CREATE TABLE IF NOT EXISTS coals (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                heat_value REAL DEFAULT 0,
                sulfur REAL DEFAULT 0,
                ash REAL DEFAULT 0,
                price REAL DEFAULT 0,
                max_available REAL DEFAULT 0,
                min_available REAL DEFAULT 0,
                moisture REAL DEFAULT 0,
                volatile_matter REAL DEFAULT 0,
                qualifies_for_refund INTEGER DEFAULT 0,
                transport_cost REAL DEFAULT 0,
                is_active INTEGER DEFAULT 1,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        conn.execute('''
            CREATE TABLE IF NOT EXISTS optimization_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                target_power REAL NOT NULL,
                total_amount REAL NOT NULL,
                total_cost REAL NOT NULL,
                weighted_heat REAL NOT NULL,
                weighted_sulfur REAL NOT NULL,
                sulfur_in_furnace REAL NOT NULL,
                tax_refund REAL NOT NULL,
                low_heat_ratio REAL NOT NULL,
                boiler_efficiency REAL NOT NULL,
                coal_consumption REAL NOT NULL,
                profit REAL NOT NULL,
                components TEXT NOT NULL,
                byproducts TEXT,
                status TEXT DEFAULT 'optimal',
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        conn.commit()

def get_all_coals() -> List[dict]:
    with get_db() as conn:
        cursor = conn.execute(
            'SELECT * FROM coals WHERE is_active = 1 ORDER BY heat_value ASC'
        )
        rows = cursor.fetchall()
        return [dict(row) for row in rows]

def get_coal_by_id(coal_id: int) -> Optional[dict]:
    with get_db() as conn:
        cursor = conn.execute('SELECT * FROM coals WHERE id = ?', (coal_id,))
        row = cursor.fetchone()
        return dict(row) if row else None

def create_coal(data: dict) -> dict:
    with get_db() as conn:
        cursor = conn.execute('''
            INSERT INTO coals (name, heat_value, sulfur, ash, price, max_available, 
                            min_available, moisture, volatile_matter, qualifies_for_refund, transport_cost)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            data['name'], data.get('heat_value', 0), data.get('sulfur', 0),
            data.get('ash', 0), data.get('price', 0), data.get('max_available', 0),
            data.get('min_available', 0), data.get('moisture', 0), 
            data.get('volatile_matter', 0), 1 if data.get('qualifies_for_refund') else 0,
            data.get('transport_cost', 0)
        ))
        conn.commit()
        return get_coal_by_id(cursor.lastrowid)

def update_coal(coal_id: int, data: dict) -> Optional[dict]:
    with get_db() as conn:
        conn.execute('''
            UPDATE coals SET 
                name = ?, heat_value = ?, sulfur = ?, ash = ?, price = ?,
                max_available = ?, min_available = ?, moisture = ?, volatile_matter = ?,
                qualifies_for_refund = ?, transport_cost = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        ''', (
            data['name'], data.get('heat_value', 0), data.get('sulfur', 0),
            data.get('ash', 0), data.get('price', 0), data.get('max_available', 0),
            data.get('min_available', 0), data.get('moisture', 0),
            data.get('volatile_matter', 0), 1 if data.get('qualifies_for_refund') else 0,
            data.get('transport_cost', 0), coal_id
        ))
        conn.commit()
        return get_coal_by_id(coal_id)

def delete_coal(coal_id: int) -> bool:
    with get_db() as conn:
        conn.execute('UPDATE coals SET is_active = 0 WHERE id = ?', (coal_id,))
        conn.commit()
        return True

def save_optimization_history(data: dict) -> dict:
    with get_db() as conn:
        cursor = conn.execute('''
            INSERT INTO optimization_history (
                target_power, total_amount, total_cost, weighted_heat, weighted_sulfur,
                sulfur_in_furnace, tax_refund, low_heat_ratio, boiler_efficiency,
                coal_consumption, profit, components, byproducts, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            data['target_power'], data['total_amount'], data['total_cost'],
            data['weighted_heat'], data['weighted_sulfur'], data['sulfur_in_furnace'],
            data['tax_refund'], data['low_heat_ratio'], data['boiler_efficiency'],
            data['coal_consumption'], data['profit'], 
            json.dumps(data['components'], ensure_ascii=False),
            json.dumps(data.get('byproducts', {}), ensure_ascii=False),
            data.get('status', 'optimal')
        ))
        conn.commit()
        
        cursor = conn.execute('SELECT * FROM optimization_history WHERE id = ?', (cursor.lastrowid,))
        row = cursor.fetchone()
        return dict(row)

def get_optimization_history(limit: int = 50) -> List[dict]:
    with get_db() as conn:
        cursor = conn.execute(
            'SELECT * FROM optimization_history ORDER BY created_at DESC LIMIT ?',
            (limit,)
        )
        rows = cursor.fetchall()
        return [dict(row) for row in rows]

def get_history_by_id(history_id: int) -> Optional[dict]:
    with get_db() as conn:
        cursor = conn.execute('SELECT * FROM optimization_history WHERE id = ?', (history_id,))
        row = cursor.fetchone()
        return dict(row) if row else None

def delete_history(history_id: int) -> bool:
    with get_db() as conn:
        conn.execute('DELETE FROM optimization_history WHERE id = ?', (history_id,))
        conn.commit()
        return True

init_db()
