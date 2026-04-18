// panier.js — Routes API panier pour 2HBC
// Remplace le fichier panier.js existant dans le backend

const express = require("express");
const router = express.Router();
const { authenticateToken } = require("./auth");

module.exports = (db) => {
  // ─── GET /api/panier ────────────────────────────────────────────────────────
  // Retourne les articles du panier de l'utilisateur connecté,
  // avec les infos produit et le fournisseur principal
  router.get("/", authenticateToken, (req, res) => {
    try {
      const articles = db
        .prepare(
          `
          SELECT
            ap.id,
            ap.quantite,
            p.id AS produit_id,
            p.nom,
            p.ref_fabricant,
            p.specificite,
            p.image_url,
            p.marque,
            COALESCE(pf.fournisseur_nom, f.nom, 'Non défini') AS fournisseur,
            pf.prix
          FROM articles_panier ap
          JOIN paniers pa ON pa.id = ap.panier_id
          JOIN produits p  ON p.id  = ap.produit_id
          LEFT JOIN (
            SELECT pf2.produit_id, pf2.prix, f2.nom AS fournisseur_nom
            FROM produits_fournisseurs pf2
            JOIN fournisseurs f2 ON f2.id = pf2.fournisseur_id
            WHERE pf2.est_principal = 1
          ) pf ON pf.produit_id = p.id
          LEFT JOIN fournisseurs f ON f.id = (
            SELECT fournisseur_id FROM produits_fournisseurs
            WHERE produit_id = p.id LIMIT 1
          )
          WHERE pa.client_id = ?
          ORDER BY fournisseur, ap.id
        `
        )
        .all(req.user.id);

      res.json(articles);
    } catch (err) {
      console.error("Erreur GET panier:", err);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // ─── POST /api/panier ───────────────────────────────────────────────────────
  // Ajouter un produit au panier (crée le panier si inexistant)
  router.post("/", authenticateToken, (req, res) => {
    const { produit_id, quantite = 1 } = req.body;

    if (!produit_id) {
      return res.status(400).json({ error: "produit_id requis" });
    }

    try {
      // Trouver ou créer le panier actif
      let panier = db
        .prepare("SELECT id FROM paniers WHERE client_id = ? LIMIT 1")
        .get(req.user.id);

      if (!panier) {
        const result = db
          .prepare(
            "INSERT INTO paniers (client_id, date_creation) VALUES (?, datetime('now'))"
          )
          .run(req.user.id);
        panier = { id: result.lastInsertRowid };
      }

      // Vérifier si l'article existe déjà dans le panier
      const existant = db
        .prepare(
          "SELECT id, quantite FROM articles_panier WHERE panier_id = ? AND produit_id = ?"
        )
        .get(panier.id, produit_id);

      if (existant) {
        // Mettre à jour la quantité
        db.prepare("UPDATE articles_panier SET quantite = ? WHERE id = ?").run(
          existant.quantite + quantite,
          existant.id
        );
        return res.json({
          message: "Quantité mise à jour",
          id: existant.id,
          quantite: existant.quantite + quantite,
        });
      }

      // Insérer le nouvel article
      const insert = db
        .prepare(
          "INSERT INTO articles_panier (panier_id, produit_id, quantite) VALUES (?, ?, ?)"
        )
        .run(panier.id, produit_id, quantite);

      res.status(201).json({
        message: "Produit ajouté au panier",
        id: insert.lastInsertRowid,
        produit_id,
        quantite,
      });
    } catch (err) {
      console.error("Erreur POST panier:", err);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // ─── PATCH /api/panier/:id ──────────────────────────────────────────────────
  // Modifier la quantité d'un article
  router.patch("/:id", authenticateToken, (req, res) => {
    const { quantite } = req.body;
    const articleId = parseInt(req.params.id);

    if (!quantite || quantite < 1) {
      return res.status(400).json({ error: "Quantité invalide (min: 1)" });
    }

    try {
      // Vérifier que l'article appartient bien à l'utilisateur
      const article = db
        .prepare(
          `
          SELECT ap.id FROM articles_panier ap
          JOIN paniers pa ON pa.id = ap.panier_id
          WHERE ap.id = ? AND pa.client_id = ?
        `
        )
        .get(articleId, req.user.id);

      if (!article) {
        return res.status(404).json({ error: "Article non trouvé" });
      }

      db.prepare("UPDATE articles_panier SET quantite = ? WHERE id = ?").run(
        quantite,
        articleId
      );

      res.json({ message: "Quantité mise à jour", id: articleId, quantite });
    } catch (err) {
      console.error("Erreur PATCH panier:", err);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // ─── DELETE /api/panier/:id ─────────────────────────────────────────────────
  // Supprimer un article du panier
  router.delete("/:id", authenticateToken, (req, res) => {
    const articleId = parseInt(req.params.id);

    try {
      // Vérifier que l'article appartient bien à l'utilisateur
      const article = db
        .prepare(
          `
          SELECT ap.id FROM articles_panier ap
          JOIN paniers pa ON pa.id = ap.panier_id
          WHERE ap.id = ? AND pa.client_id = ?
        `
        )
        .get(articleId, req.user.id);

      if (!article) {
        return res.status(404).json({ error: "Article non trouvé" });
      }

      db.prepare("DELETE FROM articles_panier WHERE id = ?").run(articleId);

      res.json({ message: "Article supprimé", id: articleId });
    } catch (err) {
      console.error("Erreur DELETE panier:", err);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // ─── DELETE /api/panier ─────────────────────────────────────────────────────
  // Vider tout le panier
  router.delete("/", authenticateToken, (req, res) => {
    try {
      const panier = db
        .prepare("SELECT id FROM paniers WHERE client_id = ? LIMIT 1")
        .get(req.user.id);

      if (panier) {
        db.prepare("DELETE FROM articles_panier WHERE panier_id = ?").run(
          panier.id
        );
      }

      res.json({ message: "Panier vidé" });
    } catch (err) {
      console.error("Erreur DELETE panier:", err);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  return router;
};
