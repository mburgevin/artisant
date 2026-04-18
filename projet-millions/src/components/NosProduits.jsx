import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

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
  const [fournisseurChoisi, setFournisseurChoisi] = useState(best ? best.label : (allPrix[0]?.label || null));
  const [ajoutMsg, setAjoutMsg] = useState('');
  const [loadingAjout, setLoadingAjout] = useState(false);

  const ajouterAuPanier = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    setLoadingAjout(true);
    try {
      const res = await fetch(`${API_URL}/api/panier`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ produit_id: item.id, quantite: 1, fournisseur: fournisseurChoisi }),
      });
      if (res.ok) {
        setAjoutMsg('Ajouté au panier !');
        setTimeout(() => setAjoutMsg(''), 2500);
      } else {
        setAjoutMsg('Erreur, réessaie.');
      }
    } catch {
      setAjoutMsg('Erreur réseau.');
    } finally {
      setLoadingAjout(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: '#fff', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '500px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }}>
        <img src={item.image_produit_rexel || item.image_produit_sonepar || item.image_produit_yesss} alt={item.nom_produit}
          style={{ width: '100%', height: '200px', objectFit: 'contain', backgroundColor: '#f8f9fa', borderRadius: '8px', marginBottom: '20px', padding: '8px' }}
          onError={e => { e.target.style.display = 'none'; }} />
        <div style={{ fontSize: '17px', fontWeight: '700', color: '#1a1a2e', marginBottom: '4px' }}>{item.nom_produit}</div>
        <div style={{ fontSize: '12px', color: '#888', marginBottom: '20px' }}>Réf. {item['référence_fabricant']}</div>

        {allPrix.length > 0 ? (
          <>
            <div style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600', marginBottom: '10px' }}>
              Choisir le fournisseur
            </div>
            {allPrix.map(({ label, value }) => {
              const isBest = best && label === best.label;
              const isSelected = fournisseurChoisi === label;
              return (
                <div
                  key={label}
                  onClick={() => setFournisseurChoisi(label)}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '12px 14px', borderRadius: '8px', marginBottom: '8px', cursor: 'pointer',
                    border: isSelected ? '2px solid #2c3e50' : (isBest ? '2px solid #00a040' : '1px solid #eee'),
                    backgroundColor: isSelected ? '#f0f4f8' : (isBest ? '#f0faf4' : '#fff'),
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {/* Radio visuel */}
                    <div style={{
                      width: '16px', height: '16px', borderRadius: '50%',
                      border: isSelected ? '5px solid #2c3e50' : '2px solid #ccc',
                      flexShrink: 0, transition: 'all 0.15s',
                    }} />
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '14px', color: isSelected ? '#2c3e50' : (isBest ? '#00a040' : '#333') }}>{label}</div>
                      {isBest && <div style={{ fontSize: '11px', color: '#2e7d32' }}>Meilleur prix</div>}
                    </div>
                  </div>
                  <span style={{ fontWeight: '700', fontSize: '18px', color: isSelected ? '#2c3e50' : (isBest ? '#00a040' : '#333') }}>
                    {value.toFixed(2)} €
                  </span>
                </div>
              );
            })}
          </>
        ) : (
          <div style={{ textAlign: 'center', color: '#aaa', fontStyle: 'italic', padding: '20px 0' }}>Prix en cours de négociation</div>
        )}

        <button
          onClick={ajouterAuPanier}
          disabled={loadingAjout || !fournisseurChoisi}
          style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#2c3e50', color: '#fff', fontSize: '15px', fontWeight: '700', cursor: 'pointer', marginTop: '16px', opacity: (loadingAjout || !fournisseurChoisi) ? 0.7 : 1 }}
        >
          {loadingAjout ? 'Ajout en cours...' : 'Ajouter au panier'}
        </button>

        {ajoutMsg && (
          <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '14px', fontWeight: '600', color: ajoutMsg === 'Ajouté au panier !' ? '#00a040' : '#e74c3c' }}>
            {ajoutMsg}
          </div>
        )}

        <button onClick={onClose} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: 'none', backgroundColor: '#f0f4f8', color: '#555', fontSize: '14px', fontWeight: '600', cursor: 'pointer', marginTop: '8px' }}>
          Fermer
        </button>
      </div>
    </div>
  );
}

export default function NosProduits({ onLoginClick }) {
  const { user } = useAuth();
  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchLocal, setSearchLocal] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/api/recherche-produit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refFab: '' }),
    })
      .then(r => r.json())
      .then(data => setProduits(data.result || []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = produits.filter(p =>
    p.nom_produit?.toLowerCase().includes(searchLocal.toLowerCase()) ||
    p['référence_fabricant']?.toLowerCase().includes(searchLocal.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px' }}>
      {selectedItem && <DetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#1a1a2e', margin: '0 0 4px' }}>Catalogue produits</h1>
          <p style={{ fontSize: '14px', color: '#888', margin: 0 }}>{filtered.length} produit{filtered.length > 1 ? 's' : ''} disponible{filtered.length > 1 ? 's' : ''}</p>
        </div>
        <input
          type="text"
          placeholder="Filtrer par nom ou référence..."
          value={searchLocal}
          onChange={e => setSearchLocal(e.target.value)}
          style={{ padding: '8px 16px', borderRadius: '20px', border: '1px solid #ddd', fontSize: '14px', width: '260px', outline: 'none' }}
        />
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '60px', color: '#888' }}>Chargement du catalogue...</div>
      )}

      {!loading && filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px', color: '#888' }}>Aucun produit trouvé.</div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filtered.map((item, i) => {
          const best = getBestPrix(item);
          return (
            <div key={i} style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e8ecef', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', transition: 'box-shadow 0.2s ease' }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'}
            >
              <img
                src={item.image_produit_rexel || item.image_produit_sonepar || item.image_produit_yesss}
                alt={item.nom_produit}
                style={{ width: '80px', height: '80px', objectFit: 'contain', borderRadius: '8px', backgroundColor: '#f8f9fa', padding: '6px', flexShrink: 0 }}
                onError={e => { e.target.style.display = 'none'; }}
              />

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a2e', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.nom_produit}
                </div>
                <div style={{ fontSize: '12px', color: '#888' }}>Réf. {item['référence_fabricant']}</div>
              </div>

              <div style={{ flexShrink: 0, textAlign: 'right', minWidth: '160px' }}>
                {!user ? (
                  <div>
                    <div style={{ fontSize: '12px', color: '#888', marginBottom: '6px' }}>Connectez-vous pour voir les prix</div>
                    <button onClick={onLoginClick} style={{ padding: '6px 14px', borderRadius: '6px', border: 'none', backgroundColor: '#00a8cc', color: '#fff', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                      Voir les prix
                    </button>
                  </div>
                ) : best ? (
                  <div>
                    <div style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>Meilleur prix HT</div>
                    <div style={{ fontSize: '22px', fontWeight: '700', color: '#00a040' }}>{best.value.toFixed(2)} €</div>
                    <div style={{ fontSize: '11px', color: '#2e7d32' }}>chez {best.label}</div>
                  </div>
                ) : (
                  <div style={{ fontSize: '12px', color: '#aaa', fontStyle: 'italic' }}>Prix en cours de négociation</div>
                )}
              </div>

              {user && (
                <button
                  onClick={() => setSelectedItem(item)}
                  style={{ flexShrink: 0, padding: '8px 16px', borderRadius: '8px', border: '1px solid #00a8cc', backgroundColor: 'transparent', color: '#00a8cc', fontSize: '13px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#00a8cc'; e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#00a8cc'; }}
                >
                  Détails prix
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
