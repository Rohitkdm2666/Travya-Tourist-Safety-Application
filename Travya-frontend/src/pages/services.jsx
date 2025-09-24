import React from 'react';
import { useNavigate } from 'react-router-dom';

const theme = {
  colors: {
    background: '#F3F6FF',
    surface: '#FFFFFF',
    text: '#0F172A',
    textSecondary: '#5B6472',
    primary: '#2563EB',
    warning: '#F59E0B',
    error: '#EF4444',
  },
  spacing: { xs: 6, sm: 12, md: 16, lg: 20 },
  typography: { h1: { fontSize: 24, fontWeight: 700 }, body: { fontSize: 14 } },
};

// Replace with your own content: external services
const apps = {
  cabs: [
    { name: 'Uber', url: 'https://m.uber.com' },
    { name: 'Ola', url: 'https://book.olacabs.com' },
    { name: 'Rapido', url: 'https://www.rapido.bike' },
  ],
  food: [
    { name: 'Zomato', url: 'https://www.zomato.com' },
    { name: 'Swiggy', url: 'https://www.swiggy.com' },
  ],
  grocery: [
    { name: 'Blinkit', url: 'https://blinkit.com' },
    { name: 'Zepto', url: 'https://www.zepto.com' },
  ],
};

export default function ServicesHub() {
  const navigate = useNavigate();

  const open = (url) => window.open(url, '_blank');

  const Section = ({ title, emoji, items, icons = {} }) => (
    <section style={styles.section}>
      <h2 style={styles.sectionTitle}>{emoji} {title}</h2>
      <div style={styles.grid}>
        {items.map((it) => (
          <button key={it.name} style={styles.appCard} onClick={() => open(it.url)}>
            {icons[it.name] ? (
              <img src={icons[it.name]} alt={it.name} style={styles.brandIcon} />
            ) : (
              <div style={styles.appIcon}>{emoji}</div>
            )}
            <div style={{ textAlign: 'left' }}>
              <div style={styles.appName}>{it.name}</div>
              <div style={styles.appSub}>Open in browser/app</div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <header style={styles.header}>
          <h1 style={styles.title}>Travel Services</h1>
          <p style={styles.subtitle}>Quick access to hotels, cabs, food and grocery apps</p>
        </header>

        {/* Entrypoints to Hotels and Events */}
        <div style={styles.quickGrid}>
          <button style={styles.quickCard} onClick={() => navigate('/services/hotels')}>
            <div style={styles.quickEmoji}>🏨</div>
            <div>
              <div style={styles.quickTitle}>Your Hotels</div>
              <div style={styles.quickSub}>Manage photos, address, booking</div>
            </div>
          </button>
          <button style={styles.quickCard} onClick={() => navigate('/services/events')}>
            <div style={styles.quickEmoji}>📅</div>
            <div>
              <div style={styles.quickTitle}>Local Events</div>
              <div style={styles.quickSub}>Add fairs, shows, activities</div>
            </div>
          </button>
        </div>

        {/* National apps with brand icons */}
        <Section
          title="Cabs"
          emoji="🚕"
          items={apps.cabs}
          icons={{
            Uber: 'https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png',
            Ola: 'https://upload.wikimedia.org/wikipedia/commons/3/3b/Ola_Cabs_Logo.png',
            Rapido: 'https://upload.wikimedia.org/wikipedia/commons/2/2c/Rapido_logo.svg',
          }}
        />
        <Section
          title="Food Delivery"
          emoji="🍽️"
          items={apps.food}
          icons={{
            Zomato: 'https://upload.wikimedia.org/wikipedia/commons/7/75/Zomato_logo.png',
            Swiggy: 'https://upload.wikimedia.org/wikipedia/commons/1/13/Swiggy_logo.png',
          }}
        />
        <Section
          title="Grocery"
          emoji="🛒"
          items={apps.grocery}
          icons={{
            Blinkit: 'https://upload.wikimedia.org/wikipedia/commons/7/7f/Blinkit_logo.svg',
            Zepto: 'https://upload.wikimedia.org/wikipedia/commons/4/4f/Zepto_logo.png',
          }}
        />
      </div>

      {/* Footer tabs */}
      <div style={styles.footer}>
        <button style={styles.footerItem} onClick={() => navigate('/apphome')}>
          <div style={styles.footerIcon}>🏠</div>
          <span style={styles.footerText}>Home</span>
        </button>
        <button style={styles.footerItem} onClick={() => navigate('/services')}>
          <div style={styles.footerIcon}>🧭</div>
          <span style={styles.footerText}>Services</span>
        </button>
        <button style={styles.footerItem} onClick={() => navigate('/aichat')}>
          <div style={styles.footerIcon}>💬</div>
          <span style={styles.footerText}>AI Chat</span>
        </button>
        <button style={styles.footerItem} onClick={() => navigate('/profile')}>
          <div style={styles.footerIcon}>👤</div>
          <span style={styles.footerText}>Profile</span>
        </button>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: 'linear-gradient(180deg, #EEF4FF 0%, #FFFFFF 35%, #FFFFFF 100%)', color: theme.colors.text, paddingBottom: 100 },
  container: { maxWidth: 520, margin: '0 auto', padding: theme.spacing.lg },
  header: { marginBottom: 10 },
  title: { margin: 0, fontSize: 24, fontWeight: 700 },
  subtitle: { marginTop: 4, color: theme.colors.textSecondary },
  section: { marginTop: 18 },
  sectionTitle: { margin: 0, marginBottom: 10, fontSize: 18, fontWeight: 700 },
  grid: { display: 'grid', gap: 12 },
  appCard: { display: 'flex', alignItems: 'center', gap: 12, background: '#fff', border: '1px solid #E6EAF2', borderRadius: 12, padding: 14, cursor: 'pointer' },
  appIcon: { width: 40, height: 40, borderRadius: 10, background: '#F3F6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 },
  appName: { fontWeight: 700 },
  appSub: { color: theme.colors.textSecondary, fontSize: 12, marginTop: 2 },

  quickGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 18 },
  quickCard: { display: 'flex', gap: 12, alignItems: 'center', background: '#fff', border: '1px solid #E6EAF2', borderRadius: 12, padding: 14, cursor: 'pointer' },
  quickEmoji: { width: 44, height: 44, borderRadius: 12, background: '#F3F6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 },
  quickTitle: { fontWeight: 700 },
  quickSub: { color: theme.colors.textSecondary, fontSize: 12 },

  hotelGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 },
  hotelCard: { background: '#fff', border: '1px solid #E6EAF2', borderRadius: 12, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.06)' },
  hotelMedia: { height: 120, backgroundSize: 'cover', backgroundPosition: 'center' },
  hotelName: { fontWeight: 700 },
  hotelMeta: { color: theme.colors.textSecondary, fontSize: 12, marginTop: 2 },
  hotelRating: { marginTop: 6, fontWeight: 600 },
  primaryBtn: { padding: '8px 10px', borderRadius: 10, border: '1px solid #2563EB22', background: '#2563EB', color: '#fff', cursor: 'pointer' },
  ghostBtn: { padding: '8px 10px', borderRadius: 10, border: '1px solid #E6EAF2', background: '#fff', cursor: 'pointer' },

  eventsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 },
  eventCard: { background: '#fff', border: '1px solid #E6EAF2', borderRadius: 12, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.06)' },
  eventMedia: { height: 120, backgroundSize: 'cover', backgroundPosition: 'center' },
  eventTitle: { fontWeight: 700 },
  eventMeta: { color: theme.colors.textSecondary, fontSize: 12, marginTop: 2 },
  eventDesc: { color: theme.colors.textSecondary, fontSize: 12, marginTop: 6 },
  brandIcon: { width: 44, height: 44, objectFit: 'contain' },

  footer: { position: 'fixed', left: 0, right: 0, bottom: 0, background: '#FFFFFF', borderTop: '1px solid #E6EAF2', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: '10px 20px 14px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 },
  footerItem: { background: 'transparent', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 6, cursor: 'pointer', color: theme.colors.text },
  footerIcon: { width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, background: '#F3F6FF' },
  footerText: { fontSize: 12 },
};


