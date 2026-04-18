import React from 'react';

export default function Footer() {
  return (
    <footer style={{
      backgroundColor: '#2c3e50',
      color: '#fff',
      padding: '10px 20px',
      textAlign: 'center',
      fontSize: '12px',
    }}>
      © {new Date().getFullYear()} 2HBC - Tous droits réservés  <br />

      <span style={{ fontSize: '14px', fontWeight: 'bold', textAlign: 'left',}}>
        Contact : <a href="mailto:2hbc.contact@gmail.com" style={{ color: '#fff' }}>2hbc.contact@gmail.com</a>
      </span> 
    </footer>
    
  );
}
