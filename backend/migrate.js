// migrate.js — Lance ce script UNE FOIS pour créer les tables manquantes
// Usage : node migrate.js

const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'produits.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS paniers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL,
    date_creation TEXT DEFAULT (datetime('now'))
  )
`);
console.log('✅ Table paniers OK');

db.exec(`
  CREATE TABLE IF NOT EXISTS articles_panier (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    panier_id INTEGER NOT NULL,
    produit_id INTEGER NOT NULL,
    fournisseur TEXT DEFAULT 'meilleur',
    quantite INTEGER DEFAULT 1
  )
`);
console.log('✅ Table articles_panier OK');

db.close();
console.log('Migration terminée !');
