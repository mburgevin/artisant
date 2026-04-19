import React from 'react';
import { useAuth } from './AuthContext';

const HISTORIQUE = [
  { date: '14 avr. 2026', produit: 'Spot LED X6 fixe 5W chrome',       fournisseur: 'Yesss',   prix: 6.80,    economie: 0.80  },
  { date: '10 avr. 2026', produit: 'Etic compact radiateur 1000W',      fournisseur: 'Sonepar', prix: 238.50,  economie: 18.50 },
  { date: '2 avr. 2026',  produit: 'KXK 110-51 ON/OFF',                 fournisseur: 'Rexel',   prix: 52.10,   economie: 4.20  },
  { date: '28 mar. 2026', produit: 'Spot LED encastrable X4',            fournisseur: 'Sonepar', prix: 8.20,    economie: 0.60  },
  { date: '21 mar. 2026', produit: 'Chaudière murale MCR2 35 BIC',      fournisseur: 'Rexel',   prix: 1240.00, economie: 95.00 },
  { date: '12 mar. 2026', produit: 'SPOT Combo encastrable',             fournisseur: 'Sonepar', prix: 11.20,   economie: 1.10  },
];

const BADGE_COLORS = {
  Rexel:   { bg: '#E6F1FB', color: '#0C447C' },
  Sonepar: { bg: '#EAF3DE', color: '#27500A' },
  Yesss:   { bg: '#FAEEDA', color: '#633806' },
};

const S = {
  page: { maxWidth: 860, margin: '40px auto', padding: '0 20px 60px', fontFamily: "'Segoe UI', system-ui, sans-serif" },
  sectionTitle: { fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 12px' },
  metricGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 32 },
  metric: { background: '#f8fafc', borderRadius: 8, padding: '16px 20px' },
  metricLabel: { fontSize: 12, color: '#64748b', margin: '0 0 6px' },
  metricValue: { fontSize: 26, fontWeight: 600, margin: 0, color: '#1e293b' },
  metricValueGreen: { fontSize: 26, fontWeight: 600, margin: 0, color: '#1D9E75' },
  metricSub: { fontSize: 12, color: '#94a3b8', margin: '4px 0 0' },
  card: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '20px 24px', marginBottom: 24 },
  tableHead: { display: 'grid', gridTemplateColumns: '110px 1fr 100px 90px 80px', gap: 8, paddingBottom: 8, borderBottom: '1px solid #e2e8f0', fontSize: 11, color: '#94a3b8', fontWeight: 600 },
  tableRow: { display: 'grid', gridTemplateColumns: '110px 1fr 100px 90px 80px', gap: 8, alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f1f5f9', fontSize: 13 },
  eco: { fontSize: 13, fontWeight: 600, color: '#1D9E75' },
  projRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f1f5f9', fontSize: 14 },
  projNote: { marginTop: 12, padding: '10px 14px', background: '#f8fafc', borderRadius: 8, fontSize: 12, color: '#94a3b8' },
  chartWrap: { width: '100%', height: 220, position: 'relative' },
};

export default function Dashboard() {
  const { user } = useAuth();
  const totalEco = HISTORIQUE.reduce((s, r) => s + r.economie, 0);

  if (!user) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300, gap: 12 }}>
        <p style={{ fontSize: 16, color: '#64748b', margin: 0 }}>Connectez-vous pour voir vos économies.</p>
      </div>
    );
  }

  // Chart via useEffect
  React.useEffect(() => {
    if (!window.Chart) return;
    const ctx = document.getElementById('chartEco');
    if (!ctx) return;
    if (ctx._chart) ctx._chart.destroy();
    const chart = new window.Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Nov. 25', 'Déc. 25', 'Jan. 26', 'Fév. 26', 'Mar. 26', 'Avr. 26'],
        datasets: [{
          data: [28, 41, 55, 72, 118, 73],
          backgroundColor: '#9FE1CB',
          borderColor: '#1D9E75',
          borderWidth: 1,
          borderRadius: 4,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => c.parsed.y + ' €' } } },
        scales: {
          y: { beginAtZero: true, ticks: { callback: v => v + ' €', font: { size: 11 } }, grid: { color: 'rgba(0,0,0,0.06)' } },
          x: { ticks: { font: { size: 11 }, autoSkip: false }, grid: { display: false } }
        }
      }
    });
    ctx._chart = chart;
    return () => chart.destroy();
  }, []);

  return (
    <div style={S.page}>

      {/* Métriques */}
      <p style={S.sectionTitle}>Résumé des économies</p>
      <div style={S.metricGrid}>
        <div style={S.metric}>
          <p style={S.metricLabel}>Économies cumulées</p>
          <p style={S.metricValueGreen}>{totalEco.toFixed(0)} €</p>
          <p style={S.metricSub}>depuis l'inscription (4 mois)</p>
        </div>
        <div style={S.metric}>
          <p style={S.metricLabel}>Commandes passées</p>
          <p style={S.metricValue}>11</p>
          <p style={S.metricSub}>via 2HBC</p>
        </div>
        <div style={S.metric}>
          <p style={S.metricLabel}>Économie moyenne</p>
          <p style={S.metricValueGreen}>8,4 %</p>
          <p style={S.metricSub}>vs prix catalogue public</p>
        </div>
      </div>

      {/* Historique */}
      <p style={S.sectionTitle}>Historique des commandes</p>
      <div style={S.card}>
        <div style={S.tableHead}>
          <span>Date</span><span>Produit</span><span>Fournisseur</span><span>Prix payé</span><span>Économie</span>
        </div>
        {HISTORIQUE.map((r, i) => {
          const bc = BADGE_COLORS[r.fournisseur] || { bg: '#f1f5f9', color: '#334155' };
          return (
            <div key={i} style={S.tableRow}>
              <span style={{ color: '#94a3b8' }}>{r.date}</span>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.produit}</span>
              <span>
                <span style={{ background: bc.bg, color: bc.color, padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>
                  {r.fournisseur}
                </span>
              </span>
              <span>{r.prix.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>
              <span style={S.eco}>- {r.economie.toFixed(2)} €</span>
            </div>
          );
        })}
      </div>

      {/* Graphique */}
      <p style={S.sectionTitle}>Évolution des économies (6 derniers mois)</p>
      <div style={S.card}>
        <div style={S.chartWrap}>
          <canvas id="chartEco" />
        </div>
      </div>

      {/* Projection */}
      <p style={S.sectionTitle}>Projection annuelle</p>
      <div style={S.card}>
        {[
          ['Rythme d\'achat actuel',          '~2,8 commandes / mois'],
          ['Volume annuel estimé',             '18 400 €'],
          ['Économies projetées sur 12 mois',  '≈ 1 160 €', true],
          ['Soit en % du volume d\'achat',     '6,3 %', true],
        ].map(([label, val, green], i) => (
          <div key={i} style={S.projRow}>
            <span style={{ color: '#64748b' }}>{label}</span>
            <span style={{ fontWeight: 600, color: green ? '#1D9E75' : '#1e293b', fontSize: green ? 16 : 14 }}>{val}</span>
          </div>
        ))}
        <p style={S.projNote}>Comparaison vs prix catalogue public fournisseurs. Vos remises personnelles éventuelles ne sont pas prises en compte.</p>
      </div>

    </div>
  );
}
