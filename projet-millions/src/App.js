import React, { useState } from 'react';
import { AuthProvider, useAuth } from './components/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import NavTabs from './components/NavTabs';
import Content from './components/Content';
import Recherche from './components/Recherche';
import AuthModal from './components/AuthModal';
import Admin from './components/Admin';
import NosProduits from './components/NosProduits';
import Panier from './components/Panier';

const styles = {
  container: {
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    minHeight: '100vh', display: 'flex', flexDirection: 'column',
    backgroundColor: '#f0f4f8',
  },
  banner: {
    backgroundColor: '#3c4b57', color: '#cce0ff',
    padding: '8px', textAlign: 'center',
    fontSize: '20px', fontWeight: 'bold',
  },
};

function AppInner() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('accueil');
  const [searchTerm, setSearchTerm] = useState('');
  const [triggerSearch, setTriggerSearch] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleSearch = (term) => {
    setSearchTerm(term);
    setTriggerSearch(true);
    setActiveTab('recherche');
  };

  const renderContent = () => {
    if (activeTab === 'recherche') {
      return (
        <Recherche
          searchTerm={searchTerm}
          triggerSearch={triggerSearch}
          setTriggerSearch={setTriggerSearch}
          onLoginClick={() => setShowAuthModal(true)}
        />
      );
    }
    if (activeTab === 'admin') {
      return <Admin />;
    }
    if (activeTab === 'panier') {
      return <Panier />;
    }
    if (activeTab === 'nos produits') {
      return <NosProduits onLoginClick={() => setShowAuthModal(true)} />;
    }
    return <Content activeTab={activeTab} />;
  };

  return (
    <div style={styles.container}>
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}

      <Header
        onSearch={handleSearch}
        user={user}
        onLoginClick={() => setShowAuthModal(true)}
        onLogout={logout}
        onPanier={() => setActiveTab('panier')}
      />
      <NavTabs activeTab={activeTab} setActiveTab={setActiveTab} user={user} />

      <div style={styles.banner}>
        2HBC, un accès simple à des prix groupés. Pensé pour les artisans, porté par les artisans.
      </div>

      {renderContent()}

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}