import React, { useState } from 'react';
import { useAuth } from './AuthContext';

const overlay = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
};
const modal = {
  background: '#fff', borderRadius: '16px', padding: '32px',
  width: '100%', maxWidth: '420px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
};
const inputStyle = {
  width: '100%', padding: '10px 14px', borderRadius: '8px',
  border: '1px solid #ddd', fontSize: '14px', marginBottom: '12px',
  boxSizing: 'border-box', outline: 'none', display: 'block',
};
const btnPrimary = {
  width: '100%', padding: '12px', borderRadius: '8px', border: 'none',
  backgroundColor: '#00a8cc', color: '#fff', fontSize: '15px',
  fontWeight: '600', cursor: 'pointer', marginTop: '4px',
};

export default function AuthModal({ onClose }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ nom: '', email: '', mot_de_passe: '' });
  const [erreur, setErreur] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    setErreur('');
    setLoading(true);
    try {
      if (mode === 'login') await login(form.email, form.mot_de_passe);
      else await register(form.nom, form.email, form.mot_de_passe);
      onClose();
    } catch (err) {
      setErreur(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={modal}>
        <h2 style={{ margin: '0 0 4px', fontSize: '22px', color: '#1a1a2e' }}>
          {mode === 'login' ? 'Se connecter' : 'Créer un compte'}
        </h2>
        <p style={{ margin: '0 0 24px', fontSize: '13px', color: '#888' }}>
          {mode === 'login' ? 'Accédez aux prix négociés 2HBC' : 'Rejoignez la communauté artisans 2HBC'}
        </p>
        <form onSubmit={submit}>
          {mode === 'register' && (
            <input style={inputStyle} type="text" name="nom" placeholder="Votre nom" value={form.nom} onChange={handle} required />
          )}
          <input style={inputStyle} type="email" name="email" placeholder="Email" value={form.email} onChange={handle} required />
          <input style={inputStyle} type="password" name="mot_de_passe" placeholder="Mot de passe" value={form.mot_de_passe} onChange={handle} required />
          {erreur && (
            <div style={{ background: '#fff0f0', border: '1px solid #ffcccc', borderRadius: '8px', padding: '10px 14px', color: '#cc0000', fontSize: '13px', marginBottom: '12px' }}>
              {erreur}
            </div>
          )}
          <button style={btnPrimary} type="submit" disabled={loading}>
            {loading ? 'Chargement...' : mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
          </button>
        </form>
        <button
          style={{ background: 'none', border: 'none', color: '#00a8cc', cursor: 'pointer', fontSize: '13px', marginTop: '16px', width: '100%', textAlign: 'center' }}
          onClick={() => { setMode(m => m === 'login' ? 'register' : 'login'); setErreur(''); }}
        >
          {mode === 'login' ? "Pas encore de compte ? S'inscrire" : 'Déjà un compte ? Se connecter'}
        </button>
      </div>
    </div>
  );
}
