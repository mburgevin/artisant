import { useEffect, useState, useContext } from "react";
import { AuthContext } from "./AuthContext";

const API = "http://localhost:4000";

// Mapping fournisseur → URL de redirection (à adapter selon les vraies URLs)
const FOURNISSEUR_REDIRECT = {
  Rexel: "https://www.rexel.fr/fre/cart",
  Sonepar: "https://www.sonepar.fr/cart",
  Yess: "https://www.yesss.fr/cart",
  Yesss: "https://www.yesss.fr/cart",
};

export default function Panier() {
  const { token } = useContext(AuthContext);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [redirecting, setRedirecting] = useState(null); // nom du fournisseur en cours

  // Charger le panier
  const fetchPanier = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/panier`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erreur chargement panier");
      const data = await res.json();
      setArticles(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchPanier();
  }, [token]);

  // Modifier la quantité d'un article
  const updateQuantite = async (articleId, nouvelleQte) => {
    if (nouvelleQte < 1) {
      supprimerArticle(articleId);
      return;
    }
    try {
      await fetch(`${API}/api/panier/${articleId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantite: nouvelleQte }),
      });
      setArticles((prev) =>
        prev.map((a) =>
          a.id === articleId ? { ...a, quantite: nouvelleQte } : a
        )
      );
    } catch (e) {
      console.error("Erreur modification quantité", e);
    }
  };

  // Supprimer un article
  const supprimerArticle = async (articleId) => {
    try {
      await fetch(`${API}/api/panier/${articleId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setArticles((prev) => prev.filter((a) => a.id !== articleId));
    } catch (e) {
      console.error("Erreur suppression", e);
    }
  };

  // Tout commander (tous les fournisseurs)
  const toutCommander = () => {
    const groupes = grouperParFournisseur(articles);
    Object.entries(groupes).forEach(([fournisseur, items]) => {
      redirectFournisseur(fournisseur, items);
    });
  };

  // Redirection vers un fournisseur avec le panier prérempli
  const redirectFournisseur = (fournisseur, items) => {
    setRedirecting(fournisseur);

    const baseUrl = FOURNISSEUR_REDIRECT[fournisseur];
    if (!baseUrl) {
      alert(`URL de redirection non configurée pour ${fournisseur}`);
      setRedirecting(null);
      return;
    }

    // Construction du payload (à adapter selon l'API réelle du fournisseur)
    const refs = items
      .map((item) => `${item.ref_fabricant}:${item.quantite}`)
      .join(",");
    const url = `${baseUrl}?refs=${encodeURIComponent(refs)}&source=2hbc`;

    // Simuler un délai (vrai redirect serait via form POST ou deep link)
    setTimeout(() => {
      window.open(url, "_blank");
      setRedirecting(null);
    }, 800);
  };

  // Grouper les articles par fournisseur (champ `fournisseur` sur chaque article)
  const grouperParFournisseur = (articles) => {
    return articles.reduce((acc, article) => {
      const f = article.fournisseur || "Non défini";
      if (!acc[f]) acc[f] = [];
      acc[f].push(article);
      return acc;
    }, {});
  };

  if (!token) {
    return (
      <div style={styles.emptyWrap}>
        <div style={styles.emptyBox}>
          <span style={styles.emptyIcon}>🔒</span>
          <p style={styles.emptyText}>Connectez-vous pour voir votre panier.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={styles.emptyWrap}>
        <div style={styles.loader} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.emptyWrap}>
        <p style={{ color: "#e74c3c" }}>{error}</p>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div style={styles.emptyWrap}>
        <div style={styles.emptyBox}>
          <span style={styles.emptyIcon}>🛒</span>
          <p style={styles.emptyText}>Votre panier est vide.</p>
        </div>
      </div>
    );
  }

  const groupes = grouperParFournisseur(articles);

  return (
    <div style={styles.page}>
      {/* Header panier */}
      <div style={styles.pageHeader}>
        <h2 style={styles.titre}>Détail du panier</h2>
        <button style={styles.btnToutCommander} onClick={toutCommander}>
          Tout commander
        </button>
      </div>

      {/* Table header */}
      <div style={styles.tableHeader}>
        <span style={styles.colFournisseur}>Fournisseurs</span>
        <span style={styles.colProduits}>Produits</span>
        <span style={styles.colQuantite}>Quantité</span>
      </div>

      {/* Groupes par fournisseur */}
      {Object.entries(groupes).map(([fournisseur, items]) => (
        <div key={fournisseur} style={styles.groupe}>
          {/* Ligne fournisseur */}
          <div style={styles.fournisseurRow}>
            <span style={styles.fournisseurNom}>
              <span style={styles.triangle}>▼</span> {fournisseur}
            </span>
            <button
              style={{
                ...styles.btnCommander,
                opacity: redirecting === fournisseur ? 0.7 : 1,
              }}
              onClick={() => redirectFournisseur(fournisseur, items)}
              disabled={redirecting === fournisseur}
            >
              {redirecting === fournisseur ? "Redirection..." : "Commander"}
            </button>
          </div>

          {/* Articles de ce fournisseur */}
          {items.map((article) => (
            <div key={article.id} style={styles.articleCard}>
              {/* Image */}
              <div style={styles.imgWrap}>
                {article.image_url ? (
                  <img
                    src={article.image_url}
                    alt={article.nom}
                    style={styles.img}
                  />
                ) : (
                  <div style={styles.imgPlaceholder}>📦</div>
                )}
              </div>

              {/* Infos produit */}
              <div style={styles.articleInfo}>
                <p style={styles.articleNom}>{article.nom}</p>
                <p style={styles.articleRef}>Réf Fab : {article.ref_fabricant}</p>
                <ul style={styles.specs}>
                  {article.specificite &&
                    String(article.specificite)
                      .split(/[;\n]/)
                      .filter(Boolean)
                      .slice(0, 5)
                      .map((s, i) => (
                        <li key={i} style={styles.specItem}>
                          {s.trim()}
                        </li>
                      ))}
                </ul>
              </div>

              {/* Quantité + supprimer */}
              <div style={styles.qteWrap}>
                <div style={styles.qteBox}>
                  <button
                    style={styles.qteBtn}
                    onClick={() =>
                      updateQuantite(article.id, article.quantite - 1)
                    }
                  >
                    −
                  </button>
                  <span style={styles.qteVal}>{article.quantite}</span>
                  <button
                    style={styles.qteBtn}
                    onClick={() =>
                      updateQuantite(article.id, article.quantite + 1)
                    }
                  >
                    +
                  </button>
                </div>
                <button
                  style={styles.btnSupp}
                  onClick={() => supprimerArticle(article.id)}
                  title="Supprimer"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/* ─── Styles ─── */
const C = {
  teal: "#1a9ba1",
  tealDark: "#17858a",
  navy: "#2c3e50",
  border: "#e2e8f0",
  bg: "#f8fafc",
  text: "#334155",
  muted: "#64748b",
  white: "#ffffff",
  red: "#e74c3c",
};

const styles = {
  page: {
    maxWidth: 860,
    margin: "32px auto",
    padding: "0 16px 60px",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    color: C.text,
  },
  pageHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  titre: {
    fontSize: 22,
    fontWeight: 700,
    color: C.navy,
    margin: 0,
  },
  btnToutCommander: {
    background: C.navy,
    color: C.white,
    border: "none",
    borderRadius: 6,
    padding: "10px 22px",
    fontWeight: 600,
    fontSize: 14,
    cursor: "pointer",
  },
  tableHeader: {
    display: "grid",
    gridTemplateColumns: "180px 1fr 120px",
    borderBottom: `2px solid ${C.border}`,
    paddingBottom: 10,
    marginBottom: 8,
    fontWeight: 600,
    fontSize: 14,
    color: C.muted,
  },
  colFournisseur: {},
  colProduits: {},
  colQuantite: { textAlign: "center" },

  groupe: {
    marginBottom: 28,
    borderRadius: 10,
    border: `1px solid ${C.border}`,
    overflow: "hidden",
    background: C.white,
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  },
  fournisseurRow: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    padding: "14px 20px",
    background: C.bg,
    borderBottom: `1px solid ${C.border}`,
  },
  triangle: { fontSize: 10, color: C.muted },
  fournisseurNom: {
    fontWeight: 700,
    fontSize: 16,
    color: C.navy,
    flex: 1,
  },
  btnCommander: {
    background: C.navy,
    color: C.white,
    border: "none",
    borderRadius: 6,
    padding: "8px 18px",
    fontWeight: 600,
    fontSize: 13,
    cursor: "pointer",
    transition: "opacity 0.2s",
  },

  articleCard: {
    display: "grid",
    gridTemplateColumns: "80px 1fr 120px",
    alignItems: "center",
    gap: 16,
    padding: "16px 20px",
    borderBottom: `1px solid ${C.border}`,
  },
  imgWrap: {
    width: 80,
    height: 70,
    borderRadius: 8,
    border: `1px solid ${C.border}`,
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: C.bg,
  },
  img: { width: "100%", height: "100%", objectFit: "contain" },
  imgPlaceholder: { fontSize: 28 },

  articleInfo: { flex: 1 },
  articleNom: {
    fontWeight: 600,
    fontSize: 13,
    color: C.navy,
    margin: "0 0 2px",
    lineHeight: 1.4,
  },
  articleRef: {
    fontSize: 12,
    color: C.muted,
    margin: "0 0 6px",
  },
  specs: {
    margin: 0,
    padding: "0 0 0 14px",
    listStyle: "disc",
  },
  specItem: {
    fontSize: 12,
    color: C.muted,
    lineHeight: 1.6,
  },

  qteWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
  },
  qteBox: {
    display: "flex",
    alignItems: "center",
    border: `1.5px solid ${C.border}`,
    borderRadius: 20,
    overflow: "hidden",
    background: C.white,
  },
  qteBtn: {
    width: 30,
    height: 30,
    border: "none",
    background: "transparent",
    fontSize: 16,
    cursor: "pointer",
    color: C.teal,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  qteVal: {
    minWidth: 28,
    textAlign: "center",
    fontWeight: 700,
    fontSize: 14,
    color: C.navy,
  },
  btnSupp: {
    background: "transparent",
    border: "none",
    color: "#cbd5e1",
    fontSize: 14,
    cursor: "pointer",
    padding: 4,
    borderRadius: 4,
    transition: "color 0.2s",
  },

  emptyWrap: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: 300,
  },
  emptyBox: {
    textAlign: "center",
  },
  emptyIcon: { fontSize: 48 },
  emptyText: {
    marginTop: 12,
    color: C.muted,
    fontSize: 16,
  },
  loader: {
    width: 40,
    height: 40,
    border: `4px solid ${C.border}`,
    borderTop: `4px solid ${C.teal}`,
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
};
