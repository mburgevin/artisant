const db = require('./database');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const csvPath = path.join(__dirname, 'produits.csv');

const insert = db.prepare(`
  INSERT OR IGNORE INTO produits 
    (reference_fabricant, nom_produit, url_rexel, image_rexel, url_sonepar, image_sonepar, url_yesss, image_yesss)
  VALUES 
    (@ref, @nom, @url_rexel, @image_rexel, @url_sonepar, @image_sonepar, @url_yesss, @image_yesss)
`);

let count = 0;

fs.createReadStream(csvPath)
  .pipe(csv())
  .on('data', (row) => {
    insert.run({
      ref:          row['référence_fabricant'],
      nom:          row['nom_produit'],
      url_rexel:    row['url_produit_rexel'],
      image_rexel:  row['image_produit_rexel'],
      url_sonepar:  row['url_produit_sonepar'],
      image_sonepar:row['image_produit_sonepar'],
      url_yesss:    row['url_produit_yesss'],
      image_yesss:  row['image_produit_yesss'],
    });
    count++;
  })
  .on('end', () => {
    console.log(`✅ ${count} produits importés dans la BDD`);
  });