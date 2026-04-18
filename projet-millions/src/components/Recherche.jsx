import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

const styles = {
  mainContent: {
    flexGrow: 1, padding: '40px 20px',
    maxWidth: '1100px', margin: '30px auto', width: '100%',
  },
  resultsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '24px', marginTop: '24px',
  },
  card: {
    backgroundColor: '#fff', borderRadius: '12px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.08)', padding: '16px',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    border: '1px solid #e8ecef', display: 'flex', flexDirection: 'column',
    cursor: 'pointer',
  },
  image: {
    width: '100%', height: '160px', objectFit: 'contain',
    borderRadius: '8px', marginBottom: '12px',
    backgroundColor: '#f8f9fa', padding: '8px',
  },
  productName: {
    fontSize: '14px', fontWeight: '600', marginBottom: '14px',
    color: '#1a1a2e', lineHeight: '1.4', flexGrow: 1,
  },
  lockBox: {
    backgroundColor: '#f0f4ff', borderRadius: '8px', padding: '14px',
    marginBottom: '14px', textAlign: 'center', border: '1px dashed #aac',
  },
  lockBtn: {
    display: 'inline-block', marginTop: '8px', padding: '6px 16px',
    borderRadius: '6px', backgroundColor: '#00a8cc', color: '#fff',
    fontSize: '12px', fontWeight: '600', border: 'none', cursor: 'pointer',
  },
  bestPrixBox: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#f0faf4', borderRadius: '8px', padding: '10px 14px',
    marginBottom: '14px', border: '1px solid #c8e6c9',
  },
  bestPrixLabel: { fontSize: '11px', color: '#555', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' },
  bestPrixValue: { fontSize: '20px', fontWeight: '700', color: '#00a040' },
  bestPrixSite: { fontSize: '12px', color: '#2e7d32', fontWeight: '500', marginTop: '2px' },
  negotieBadge: {
    fontSize: '10px', backgroundColor: '#e8f5e9', color: '#2e7d32',
    padding: '3px 8px', borderRadius: '99px', fontWeight: '600',
  },
  enCoursBox: {
    backgroundColor: '#f8f9fa', borderRadius: '8px', padding: '10px 14px',
    marginBottom: '14px', fontSize: '12px', color: '#aaa', fontStyle: 'italic',
    textAlign: 'center',
  },
  detailBtn: {
    width: '100%', padding: '9px', borderRadius: '6px',
    border: '1px solid #00a8cc', backgroundColor: 'transparent',
    color: '#00a8cc', fontWeight: '600', fontSize: '13px',
    cursor: 'pointer', marginBottom: '8px',
    transition: 'background-color 0.2s ease, color 0.2s ease',
  },
  links: { display: 'flex', gap: '8px' },
  linkBtn: {
    flexGrow: 1, textAlign: 'center', padding: '8px 10px',
    borderRadius: '6px', backgroundColor: '#00a8cc', color: '#fff',
    textDecoration: 'none', fontWeight: '600', fontSize: '13px', display: 'inline-block',
  },
  spinnerWrapper: {
    display: 'flex', flexDirection: 'column',
    justifyContent: 'center', alignItems: 'center',
    marginTop: '60px', gap: '16px',
  },
  message: { textAlign: 'center', marginTop: '40px', fontSize: '16px', color: '#888' },
  titre: { fontSize: '22px', fontWeight: '700', color: '#1a1a2e', marginBottom: '4px' },
  sousTitre: { fontSize: '14px', color: '#888', marginBottom: '0' },
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
  },
  modal: {
    background: '#fff', borderRadius: '16px', padding: '28px',
    width: '100%', maxWidth: '480px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
    maxHeight: '90vh', overflowY: 'auto',
  },
  modalTitle: { fontSize: '18px', fontWeight: '700', color: '#1a1a2e', marginBottom: '4px' },
  modalRef: { fontSize: '12px', color: '#888', marginBottom: '20px' },
  modalImage: {
    width: '100%', height: '200px', objectFit: 'contain',
    backgroundColor: '#f8f9fa', borderRadius: '8px', marginBottom: '20px', padding: '8px',
  },
  prixRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '12px 14px', borderRadius: '8px', marginBottom: '8px',
    border: '1px solid #eee',
  },
  prixRowBest: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '12px 14px', borderRadius: '8px', marginBottom: '8px',
    border: '2px solid #00a040', backgroundColor: '#f0faf4',
  },
  closeBtn: {
    width: '100%', padding: '10px', borderRadius: '8px', border: 'none',
    backgroundColor: '#f0f4f8', color: '#555', fontSize: '14px',
    fontWeight: '600', cursor: 'pointer', marginTop: '8px',
  },
};

function getBestPrix(item) {
  const prix = [
    { label: 'Rexel',   value: item.prix_rexel,   url: item.url_produit_rexel },
    { label: 'Sonepar', value: item.prix_sonepar,  url: item.url_produit_sonepar },
    { label: 'Yesss',   value: item.prix_yesss,    url: item.url_produit_yesss },
  ].filter(p => p.value !== null && p.value !== undefined);
  if (prix.length === 0) return null;
  return prix.reduce((a, b) => a.value < b.value ? a : b);
}

function getAllPrix(item) {
  return [
    { label: 'Rexel',   value: item.prix_rexel,   url: item.url_produit_rexel },
    { label: 'Sonepar', value: item.prix_sonepar,  url: item.url_produit_sonepar },
    { label: 'Yesss',   value: item.prix_yesss,    url: item.url_produit_yesss },
  ].filter(p => p.value !== null && p.value !== undefined);
}

function DetailModal({ item, onClose }) {
  const allPrix = getAllPrix(item);
  const best = getBestPrix(item);

  return (
    <div style={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={styles.modal}>
        <img
          src={item.image_produit_rexel || item.image_produit_sonepar || item.image_produit_yesss}
          alt={item.nom_produit}
          style={styles.modalImage}
          onError={e => { e.target.style.display = 'none'; }}
        />
        <div style={styles.modalTitle}>{item.nom_produit}</div>
        <div style={styles.modalRef}>Réf. {item['référence_fabricant']}</div>

        {allPrix.length > 0 ? (
          <>
            <div style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600', marginBottom: '10px' }}>
              Comparatif prix fournisseurs (HT)
            </div>
            {allPrix.map(({ label, value, url }) => {
              const isBest = best && label === best.label;
              return (
                <div key={label} style={isBest ? styles.prixRowBest : styles.prixRow}>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '14px', color: isBest ? '#00a040' : '#333' }}>{label}</div>
                    {isBest && <div style={{ fontSize: '11px', color: '#2e7d32' }}>Meilleur prix</div>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontWeight: '700', fontSize: '18px', color: isBest ? '#00a040' : '#333' }}>
                      {value.toFixed(2)} €
                    </span>
                    {url && (
                      <a href={url} target="_blank" rel="noreferrer"
                        style={{ padding: '5px 12px', borderRadius: '6px', backgroundColor: '#00a8cc', color: '#fff', textDecoration: 'none', fontSize: '12px', fontWeight: '600' }}>
                        Commander
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </>
        ) : (
          <div style={{ textAlign: 'center', color: '#aaa', fontStyle: 'italic', padding: '20px 0' }}>
            Prix en cours de négociation
          </div>
        )}

        <button style={styles.closeBtn} onClick={onClose}>Fermer</button>
      </div>
    </div>
  );
}

export default function Recherche({ searchTerm, triggerSearch, setTriggerSearch, onLoginClick }) {
  const { user } = useAuth();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [hoveredLink, setHoveredLink] = useState(null);

  useEffect(() => {
    if (!triggerSearch) return;
    const fetchResults = async () => {
      setLoading(true);
      setResults(null);
      setTriggerSearch(false);
      try {
        const terme = searchTerm.trim();
        // C'est une référence si : contient des chiffres OU contient un tiret OU fait moins de 4 caractères
        const estRef = terme !== '' && (
        /\d/.test(terme) ||        // contient au moins un chiffre
        terme.includes('-') ||     // contient un tiret
        terme.length <= 3          // très court = probablement une ref
      );
      const body = terme === ''
      ? { refFab: '' }
      : estRef
        ? { refFab: terme }
        : { motsCles: terme };
        const response = await fetch(`${API_URL}/api/recherche-produit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const data = await response.json();
        setResults(response.ok && Array.isArray(data.result) ? data.result : []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [triggerSearch, searchTerm, setTriggerSearch]);

  const renderPrix = (item) => {
    if (!user) {
      return (
        <div style={styles.lockBox}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#556" strokeWidth="2" style={{ marginBottom: '6px' }}>
            <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <div style={{ fontSize: '12px', color: '#556', lineHeight: '1.6' }}>
            Connectez-vous pour accéder<br />aux prix négociés 2HBC
          </div>
          <button style={styles.lockBtn} onClick={onLoginClick}>Voir les prix</button>
        </div>
      );
    }

    const best = getBestPrix(item);
    if (!best) {
      return <div style={styles.enCoursBox}>Prix en cours de négociation</div>;
    }

    return (
      <div style={styles.bestPrixBox}>
        <div>
          <div style={styles.bestPrixLabel}>Meilleur prix HT</div>
          <div style={styles.bestPrixValue}>{best.value.toFixed(2)} €</div>
          <div style={styles.bestPrixSite}>chez {best.label}</div>
        </div>
        <span style={styles.negotieBadge}>Négocié 2HBC</span>
      </div>
    );
  };

  const renderBtn = (url, label) => {
    if (!url) return null;
    return (
      <a href={url} target="_blank" rel="noreferrer"
        style={{ ...styles.linkBtn, backgroundColor: hoveredLink === url ? '#005163' : '#00a8cc' }}
        onMouseEnter={() => setHoveredLink(url)}
        onMouseLeave={() => setHoveredLink(null)}
      >
        {label}
      </a>
    );
  };

  return (
    <main style={styles.mainContent}>
      {selectedItem && <DetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />}

      <h2 style={styles.titre}>Résultats de recherche</h2>
      {!searchTerm && <p style={styles.message}>Saisissez une référence pour lancer la recherche.</p>}

      {loading && (
        <div style={styles.spinnerWrapper}>
          <div style={{ width: '40px', height: '40px', border: '3px solid #eee', borderTop: '3px solid #00a8cc', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <span style={{ color: '#888', fontSize: '14px' }}>Recherche en cours...</span>
        </div>
      )}

      {results && results.length === 0 && <p style={styles.message}>Aucun produit trouvé.</p>}

      {results && results.length > 0 && (
        <>
          <p style={styles.sousTitre}>{results.length} produit{results.length > 1 ? 's' : ''} trouvé{results.length > 1 ? 's' : ''}</p>
          <div style={styles.resultsGrid}>
            {results.map((item, i) => (
              <div key={i} style={styles.card}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'; }}
              >
                <img src={item.image_produit_rexel || item.image_produit_sonepar || item.image_produit_yesss} alt={item.nom_produit} style={styles.image} onError={e => { e.target.style.display = 'none'; }} />
                <div style={styles.productName}>{item.nom_produit}</div>
                {renderPrix(item)}
                {user && (
                  <button
                    style={styles.detailBtn}
                    onClick={() => setSelectedItem(item)}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#00a8cc'; e.currentTarget.style.color = '#fff'; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#00a8cc'; }}
                  >
                    Voir les détails prix
                  </button>
                )}
                <div style={styles.links}>
                  {renderBtn(item.url_produit_rexel, 'Rexel')}
                  {renderBtn(item.url_produit_sonepar, 'Sonepar')}
                  {renderBtn(item.url_produit_yesss, 'Yesss')}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  );
}