-- Weekly Burnout Blocker Database Schema

-- Table for storing weekly data
CREATE TABLE IF NOT EXISTS weeks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    week_key TEXT UNIQUE NOT NULL,  -- e.g., "2025-W02" 
    start_date TEXT NOT NULL,       -- ISO date of Monday
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table for storing individual tasks
CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    week_id INTEGER NOT NULL,
    day TEXT NOT NULL,              -- monday, tuesday, etc.
    text TEXT NOT NULL,
    hours REAL DEFAULT 1.0,
    completed BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (week_id) REFERENCES weeks(id) ON DELETE CASCADE
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_tasks_week_day ON tasks(week_id, day);
CREATE INDEX IF NOT EXISTS idx_weeks_key ON weeks(week_key);

-- Table for app settings
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);