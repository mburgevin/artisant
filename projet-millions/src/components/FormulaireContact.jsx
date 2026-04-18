import React, { useRef, useState } from 'react';
import emailjs from '@emailjs/browser';


const styles = {
  container: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '20px',
    maxWidth: '600px',
    margin: '40px auto',
    boxShadow: '0 5px 20px rgba(0,0,0,0.1)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  input: {
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    fontSize: '16px',
  },
  textarea: {
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    fontSize: '16px',
    minHeight: '100px',
  },
  button: {
    backgroundColor: '#00a8cc',
    color: '#fff',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '6px',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
  message: {
    marginTop: '10px',
    fontSize: '15px',
    textAlign: 'center',
  },
};

const FormulaireContact = ({setFormStatus}) => {
  const formRef = useRef();
  const [status, setStatus] = useState(null);

  const sendEmail = (e) => {
    e.preventDefault();
    setStatus('sending');
    setFormStatus('sending');

    emailjs
      .sendForm(
        'service_lofp63c',     // Remplace par ton ID de service
        'template_13zq0cm',    // Remplace par ton ID de template
        formRef.current,
        'WnOW9wU71T41JFqJy'  // Remplace par ton Public Key (pas Secret)
      )
      .then(
        
        () => {
          setStatus('sent');
          setFormStatus('sent');
          formRef.current.reset();
        },
        (error) => {
          console.error(error.text);
          setFormStatus('error');
          setStatus('error');
        }
      );
  };

  return (
    <div style={styles.container}>
      <h3>Contactez-nous</h3>
      <form ref={formRef} onSubmit={sendEmail} style={styles.form}>
        <input type="text" name="user_name" placeholder="Votre nom" required style={styles.input} />
        <input type="email" name="user_email" placeholder="Votre email" required style={styles.input} />
        <textarea name="message" placeholder="Votre message" required style={styles.textarea}></textarea>
        <button type="submit" style={styles.button}>Envoyer</button>
      </form>

      {status === 'sending' && <p style={styles.message}>Envoi en cours...</p>}
      {status === 'sent' && <p style={{ ...styles.message, color: 'green' }}>Message envoyé !</p>}
      {status === 'error' && <p style={{ ...styles.message, color: 'red' }}>Erreur lors de l’envoi.</p>}
    </div>
  );
};

export default FormulaireContact;
