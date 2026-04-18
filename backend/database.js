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

module.exports = db;