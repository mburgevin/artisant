// migrate.js — Recrée les tables panier avec la bonne structure
// Usage : node migrate.js

const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(__dirname, 'produits.db'));

// Afficher la structure actuelle
console.log('Structure actuelle de paniers:');
console.log(db.prepare("PRAGMA table_info(paniers)").all());
console.log('Structure actuelle de articles_panier:');
console.log(db.prepare("PRAGMA table_info(articles_panier)").all());

// Sauvegarder les données existantes si possible
let paniersData = [];
let articlesData = [];
try { paniersData = db.prepare("SELECT * FROM paniers").all(); } catch {}
try { articlesData = db.prepare("SELECT * FROM articles_panier").all(); } catch {}

console.log(`\nDonnées à conserver: ${paniersData.length} paniers, ${articlesData.length} articles`);

// Supprimer et recréer avec la bonne structure
db.exec(`DROP TABLE IF EXISTS articles_panier`);
db.exec(`DROP TABLE IF EXISTS paniers`);

db.exec(`
  CREATE TABLE paniers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL,
    date_creation TEXT DEFAULT (datetime('now'))
  )
`);
console.log('✅ Table paniers recrée');

db.exec(`
  CREATE TABLE articles_panier (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    panier_id INTEGER NOT NULL,
    produit_id INTEGER NOT NULL,
    fournisseur TEXT DEFAULT 'meilleur',
    quantite INTEGER DEFAULT 1
  )
`);
console.log('✅ Table articles_panier recrée');

db.close();
console.log('\nMigration terminée ! Relance node server.js');
