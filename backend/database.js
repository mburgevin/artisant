const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'produits.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS produits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reference_fabricant TEXT UNIQUE NOT NULL,
    nom_produit TEXT,
    url_rexel TEXT,
    image_rexel TEXT,
    prix_rexel REAL,
    url_sonepar TEXT,
    image_sonepar TEXT,
    prix_sonepar REAL,
    url_yesss TEXT,
    image_yesss TEXT,
    prix_yesss REAL,
    date_maj TEXT DEFAULT (datetime('now'))
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS paniers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL,
    date_creation TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (client_id) REFERENCES clients(id)
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS articles_panier (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    panier_id INTEGER NOT NULL,
    produit_id INTEGER NOT NULL,
    quantite INTEGER DEFAULT 1,
    FOREIGN KEY (panier_id) REFERENCES paniers(id),
    FOREIGN KEY (produit_id) REFERENCES produits(id)
  )
`);

module.exports = db;