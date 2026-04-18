require('dotenv').config();

const express = require('express');
const path = require('path');
const { spawn } = require('child_process');
const cors = require('cors');
const db = require('./database');
const authRouter = require('./auth');
const adminRouter = require('./admin');
const panierRouter = require('./panier');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);
app.use('/api/panier', panierRouter(db));

app.post('/api/recherche-produit', async (req, res) => {
  const refFab = (req.body.refFab || '').trim();
  const motsCles = (req.body.motsCles || '').trim();

  // Cas 1 : tout le catalogue
  if (!refFab && !motsCles) {
    const rows = db.prepare('SELECT * FROM produits ORDER BY nom_produit').all();
    return res.json({ result: formatResults(rows) });
  }

  // Cas 2 : recherche par référence exacte
  if (refFab && /^[a-zA-Z0-9\-]{1,50}$/.test(refFab)) {
    const rows = db.prepare('SELECT * FROM produits WHERE reference_fabricant = ?').all(refFab);
    if (rows.length > 0) {
      console.log(`✅ Trouvé en BDD (ref exacte) : ${refFab}`);
      return res.json({ result: formatResults(rows) });
    }

    // Pas trouvé → scraping
    console.log(`🔍 Lancement scraping pour : ${refFab}`);
    const pythonProcess = spawn('python', [path.join(__dirname, 'add_in_bdd.py'), refFab]);
    let stderr = '';
    pythonProcess.stderr.on('data', d => { stderr += d.toString(); });

    const timeout = setTimeout(() => {
      pythonProcess.kill();
      return res.status(504).json({ error: 'Délai dépassé, réessaie dans un instant' });
    }, 30000);

    pythonProcess.on('close', (code) => {
      clearTimeout(timeout);
      if (code !== 0) {
        console.error('Erreur Python:', stderr);
        return res.status(500).json({ error: 'Erreur lors du scraping' });
      }
      const result = db.prepare('SELECT * FROM produits WHERE reference_fabricant = ?').all(refFab);
      return res.json({ result: formatResults(result) });
    });
    return;
  }

  // Cas 3 : recherche par mots-clés avec pertinence
  const terme = motsCles || refFab;
  const mots = terme.toLowerCase().split(/\s+/).filter(Boolean);

  const tous = db.prepare('SELECT * FROM produits').all();

  const scores = tous.map(produit => {
    const texte = `${produit.nom_produit || ''} ${produit.reference_fabricant || ''}`.toLowerCase();
    let score = 0;
    let tousPresents = true;

    for (const mot of mots) {
      if (texte.includes(mot)) {
        // Bonus si le mot est au début
        if (texte.startsWith(mot)) score += 10;
        // Bonus si c'est la référence exacte
        if (produit.reference_fabricant?.toLowerCase() === mot) score += 20;
        // Bonus par occurrence
        const occurrences = (texte.match(new RegExp(mot, 'g')) || []).length;
        score += occurrences * 2;
        // Bonus si tous les mots sont présents ensemble (phrase exacte)
        if (texte.includes(terme.toLowerCase())) score += 15;
      } else {
        tousPresents = false;
      }
    }

    return { produit, score, tousPresents };
  });

  // Trier : d'abord ceux qui ont tous les mots, puis par score décroissant
  const resultats = scores
    .filter(s => s.score > 0)
    .sort((a, b) => {
      if (a.tousPresents && !b.tousPresents) return -1;
      if (!a.tousPresents && b.tousPresents) return 1;
      return b.score - a.score;
    })
    .map(s => s.produit);

  console.log(`🔎 Recherche "${terme}" → ${resultats.length} résultats`);
  return res.json({ result: formatResults(resultats) });
});

function formatResults(rows) {
  return rows.map(r => ({
    'référence_fabricant': r.reference_fabricant,
    nom_produit:           r.nom_produit,
    url_produit_rexel:     r.url_rexel,
    image_produit_rexel:   r.image_rexel,
    prix_rexel:            r.prix_rexel,
    url_produit_sonepar:   r.url_sonepar,
    image_produit_sonepar: r.image_sonepar,
    prix_sonepar:          r.prix_sonepar,
    url_produit_yesss:     r.url_yesss,
    image_produit_yesss:   r.image_yesss,
    prix_yesss:            r.prix_yesss,
  }));
}

app.listen(PORT, () => {
  console.log(`🚀 Serveur en écoute sur http://localhost:${PORT}`);
});