import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

const styles = {
  page: { maxWidth: '900px', margin: '40px auto', padding: '0 20px' },
  header: { marginBottom: '32px' },
  titre: { fontSize: '24px', fontWeight: '700', color: '#1a1a2e', marginBottom: '4px' },
  sousTitre: { fontSize: '14px', color: '#888' },
  table: { width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' },
  th: { padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', backgroundColor: '#f8f9fa', borderBottom: '1px solid #eee' },
  td: { padding: '12px 16px', fontSize: '13px', color: '#333', borderBottom: '1px solid #f0f0f0', verticalAlign: 'middle' },
  ref: { fontFamily: 'monospace', fontSize: '12px', backgroundColor: '#f0f4f8', padding: '2px 6px', borderRadius: '4px' },
  input: { width: '80px', padding: '6px 8px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '13px', textAlign: 'right' },
  saveBtn: { padding: '6px 14px', borderRadius: '6px', border: 'none', backgroundColor: '#00a8cc', color: '#fff', fontSize: '12px', fontWeight: '600', cursor: 'pointer' },
  savedBtn: { padding: '6px 14px', borderRadius: '6px', border: 'none', backgroundColor: '#00a040', color: '#fff', fontSize: '12px', fontWeight: '600', cursor: 'default' },
  access: { minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px', color: '#888' },
};

export default function Admin() {
  const { user } = useAuth();
  const [produits, setProduits] = useState([]);
  const [prix, setPrix] = useState({});
  const [saved, setSaved] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    fetch(`${API_URL}/api/admin/produits`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(r => r.json())
      .then(data => {
        setProduits(data.produits || []);
        const init = {};
        (data.produits || []).forEach(p => {
          init[p.reference_fabricant] = {
            prix_rexel: p.prix_rexel ?? '',
            prix_sonepar: p.prix_sonepar ?? '',
            prix_yesss: p.prix_yesss ?? '',
          };
        });
        setPrix(init);
      })
      .finally(() => setLoading(false));
  }, [user]);

  const handleChange = (ref, fournisseur, value) => {
    setPrix(prev => ({ ...prev, [ref]: { ...prev[ref], [fournisseur]: value } }));
    setSaved(prev => ({ ...prev, [ref]: false }));
  };

  const handleSave = async (ref) => {
    const p = prix[ref];
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/api/admin/prix`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        reference_fabricant: ref,
        prix_rexel: p.prix_rexel === '' ? null : parseFloat(p.prix_rexel),
        prix_sonepar: p.prix_sonepar === '' ? null : parseFloat(p.prix_sonepar),
        prix_yesss: p.prix_yesss === '' ? null : parseFloat(p.prix_yesss),
      }),
    });
    if (res.ok) setSaved(prev => ({ ...prev, [ref]: true }));
  };

  if (!user) return <div style={styles.access}><p>Vous devez être connecté.</p></div>;
  if (user.role !== 'admin') return <div style={styles.access}><p>Accès réservé aux administrateurs.</p></div>;
  if (loading) return <div style={styles.access}><p>Chargement...</p></div>;

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.titre}>Administration — Gestion des prix</h1>
        <p style={styles.sousTitre}>{produits.length} produits dans le catalogue — saisissez les prix négociés HT</p>
      </div>

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Référence</th>
            <th style={styles.th}>Produit</th>
            <th style={{ ...styles.th, textAlign: 'right' }}>Rexel (€)</th>
            <th style={{ ...styles.th, textAlign: 'right' }}>Sonepar (€)</th>
            <th style={{ ...styles.th, textAlign: 'right' }}>Yesss (€)</th>
            <th style={styles.th}></th>
          </tr>
        </thead>
        <tbody>
          {produits.map(p => (
            <tr key={p.reference_fabricant}>
              <td style={styles.td}><span style={styles.ref}>{p.reference_fabricant}</span></td>
              <td style={styles.td}>{p.nom_produit?.substring(0, 40)}{p.nom_produit?.length > 40 ? '…' : ''}</td>
              <td style={{ ...styles.td, textAlign: 'right' }}>
                <input
                  style={styles.input}
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="—"
                  value={prix[p.reference_fabricant]?.prix_rexel ?? ''}
                  onChange={e => handleChange(p.reference_fabricant, 'prix_rexel', e.target.value)}
                />
              </td>
              <td style={{ ...styles.td, textAlign: 'right' }}>
                <input
                  style={styles.input}
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="—"
                  value={prix[p.reference_fabricant]?.prix_sonepar ?? ''}
                  onChange={e => handleChange(p.reference_fabricant, 'prix_sonepar', e.target.value)}
                />
              </td>
              <td style={{ ...styles.td, textAlign: 'right' }}>
                <input
                  style={styles.input}
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="—"
                  value={prix[p.reference_fabricant]?.prix_yesss ?? ''}
                  onChange={e => handleChange(p.reference_fabricant, 'prix_yesss', e.target.value)}
                />
              </td>
              <td style={styles.td}>
                <button
                  style={saved[p.reference_fabricant] ? styles.savedBtn : styles.saveBtn}
                  onClick={() => handleSave(p.reference_fabricant)}
                >
                  {saved[p.reference_fabricant] ? 'Sauvegardé' : 'Sauvegarder'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
