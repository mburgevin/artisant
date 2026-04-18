const Database = require('better-sqlite3');
const db = new Database('produits.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    mot_de_passe TEXT NOT NULL,
    role TEXT DEFAULT 'artisan',
    date_creation TEXT DEFAULT (datetime('now'))
  )
`);

console.log('✅ Table clients créée');