import React, { useState, useEffect } from 'react';
import FormulaireContact from './FormulaireContact';

const styles = {
  page: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
  },
  section: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    padding: '60px 30px',
    textAlign: 'center',
  },
  s1: { backgroundColor: '#00a8cc', color: '#fff' },
  s2: { backgroundColor: '#F5F7FA', color: '#333' },
  s3: { backgroundColor: '#00a8cc', color: '#fff' },
  title: { fontSize: '40px', fontWeight: '700', marginBottom: '20px' },
  text: { fontSize: '22px', lineHeight: '1.6', maxWidth: '800px', textAlign: 'left' },
  button: {
    padding: '12px 28px', fontSize: '17px', cursor: 'pointer',
    borderRadius: '8px', border: 'none', backgroundColor: '#005163',
    color: 'white', fontWeight: '600', marginTop: '16px',
  },
  formContainer: {
    marginTop: '25px', maxWidth: '700px', width: '100%',
    backgroundColor: '#e0f0f5', borderRadius: '12px',
    padding: '20px', boxSizing: 'border-box',
  },
  successMessage: {
    marginTop: '15px', color: '#3c763d', backgroundColor: '#dff0d8',
    border: '1px solid #d6e9c6', borderRadius: '8px',
    padding: '10px 15px', fontWeight: '700', fontSize: '16px',
  },
  placeholder: {
    minHeight: '60vh', display: 'flex', justifyContent: 'center',
    alignItems: 'center', flexDirection: 'column',
    backgroundColor: '#f0f4f8', color: '#333', padding: '40px',
  },
};

export default function Content({ activeTab }) {
  const [showForm, setShowForm] = useState(false);
  const [formStatus, setFormStatus] = useState(null);

  useEffect(() => {
    if (formStatus === 'sent') {
      const timer = setTimeout(() => {
        setShowForm(false);
        setFormStatus(null);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [formStatus]);

  switch (activeTab) {
    case 'accueil':
      return (
        <div style={styles.page}>
          <div style={{ ...styles.section, ...styles.s1 }}>
            <h1 style={styles.title}>Comment nous rejoindre ?</h1>
            <p style={styles.text}>
              Vous êtes artisan et vous voulez payer votre matériel moins cher sans changer vos habitudes ?
            </p>
            <p style={styles.text}>
              Il vous suffit de remplir un court formulaire avec vos besoins habituels.
              <br />
              <strong>On s'occupe du reste : négociation, comparaison, économies.</strong>
            </p>
          </div>

          <div style={{ ...styles.section, ...styles.s2 }}>
            <h2 style={{ fontSize: '36px', fontWeight: '600', marginBottom: '20px' }}>
              Pourquoi nous rejoindre ?
            </h2>
            <p style={{ ...styles.text, textAlign: 'left' }}>
              — Aucun engagement<br />
              — Aucun changement de fournisseur<br />
              — Juste des prix plus bas pour les mêmes produits<br />
              — Dashboard pour suivre vos économies
            </p>
          </div>

          <div style={{ ...styles.section, ...styles.s3 }}>
            <h2 style={styles.title}>Remplissez le formulaire</h2>
            <p style={{ fontSize: '18px', marginBottom: '8px' }}>Un expert vous recontacte sous 48h.</p>

            <button
              onClick={() => setShowForm(prev => !prev)}
              style={styles.button}
            >
              {showForm ? 'Cacher le formulaire' : 'Afficher le formulaire'}
            </button>

            {showForm && (
              <div style={styles.formContainer}>
                <FormulaireContact setFormStatus={setFormStatus} />
              </div>
            )}

            {formStatus === 'sent' && (
              <p style={styles.successMessage}>Formulaire envoyé avec succès !</p>
            )}
          </div>
        </div>
      );

    case 'nos produits':
      return (
        <div style={styles.placeholder}>
          <h2>Nos produits</h2>
          <p>Découvrez notre gamme de produits à prix groupés.</p>
        </div>
      );

    case 'nouveau':
      return (
        <div style={styles.placeholder}>
          <h2>Nouveautés</h2>
          <p>Découvrez les derniers produits ajoutés à notre catalogue.</p>
        </div>
      );

    case 'partenaires':
      return (
        <div style={styles.placeholder}>
          <h2>Nos partenaires</h2>
          <p>Rencontrez nos partenaires et découvrez leurs offres.</p>
        </div>
      );

    default:
      return <div style={styles.placeholder}>Contenu introuvable.</div>;
  }
}