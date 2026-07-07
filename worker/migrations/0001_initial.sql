-- Initial schema for Haett Partner Portal on D1 (SQLite)

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'USER',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS partner_applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  partner_type TEXT NOT NULL,
  business_name TEXT NOT NULL,
  phone TEXT,
  website TEXT,
  audience_size INTEGER,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING',
  rejection_reason TEXT,
  applied_at TEXT DEFAULT (datetime('now')),
  approved_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS discount_codes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  application_id INTEGER NOT NULL,
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL,
  discount_value REAL NOT NULL,
  is_active INTEGER DEFAULT 1,
  usage_count INTEGER DEFAULT 0,
  total_discount_given REAL DEFAULT 0,
  expiry_date TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (application_id) REFERENCES partner_applications(id)
);

-- Seed test users (password: Admin@123 and User@123)
-- These will be inserted by the Worker on first run if not exists
