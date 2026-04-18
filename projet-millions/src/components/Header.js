import React, { useState } from 'react';

const styles = {
  header: {
    backgroundColor: '#2c3e50',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 30px',
    boxShadow: '0 3px 6px rgba(0, 0, 0, 0.1)',
  },
  logo: {
    fontSize: '32px',
    fontWeight: 'bold',
    fontFamily: 'Gagalin, Impact, sans-serif',
  },
  search: {
    flex: 1,
    margin: '0 100px',
  },
  searchInput: {
    width: '100%',
    padding: '8px 12px',
    borderRadius: '20px',
    border: '1px solid #ccc',
    fontSize: '14px',
  },
  icons: {
    display: 'flex',
    gap: '20px',
    fontSize: '14px',
    alignItems: 'center',
  },
  btnConnexion: {
    backgroundColor: '#00a8cc',
    color: '#fff',
    border: 'none',
    borderRadius: '20px',
    padding: '6px 16px',
    fontSize: '14px',
    cursor: 'pointer',
    fontWeight: '600',
  },
  btnDeconnexion: {
    backgroundColor: 'transparent',
    color: '#ccc',
    border: '1px solid #ccc',
    borderRadius: '20px',
    padding: '6px 14px',
    fontSize: '13px',
    cursor: 'pointer',
  },
  userGreeting: {
    color: '#cce0ff',
    fontSize: '14px',
    fontWeight: '500',
  },
  iconBtn: {
    cursor: 'pointer',
    color: '#fff',
  },
};

export default function Header({ onSearch, user, onLoginClick, onLogout, onPanier }) {
  const [inputValue, setInputValue] = useState('');

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      onSearch(inputValue);
    }
  };

  return (
    <header style={styles.header}>
      <div style={styles.logo}>2HBC</div>

      <div style={styles.search}>
        <input
          type="text"
          placeholder="Rechercher un produit, une référence…"
          style={styles.searchInput}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyPress}
        />
      </div>

      <div style={styles.icons}>
        {user ? (
          <>
            <span style={styles.userGreeting}>Bonjour, {user.nom}</span>
            <button style={styles.btnDeconnexion} onClick={onLogout}>
              Déconnexion
            </button>
          </>
        ) : (
          <button style={styles.btnConnexion} onClick={onLoginClick}>
            Se connecter
          </button>
        )}
        <span style={styles.iconBtn}>Notre Offre</span>
        <span style={styles.iconBtn} onClick={onPanier}>Mon Panier 🛒</span>
      </div>
    </header>
  );
}