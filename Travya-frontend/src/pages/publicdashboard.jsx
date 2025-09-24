import React, { useEffect, useMemo, useRef, useState } from 'react';
import Navbar from './navbar';

const theme = {
  colors: {
    text: '#0F172A',
    textSecondary: '#5B6472',
    primary: '#2563EB',
    success: '#16A34A',
    error: '#EF4444',
  },
  spacing: { xs: 6, sm: 12, md: 16, lg: 20 },
};

export default function PublicDashboard() {
  const [activeTab, setActiveTab] = useState('alerts');
  const [selectedId, setSelectedId] = useState(null);
  const [events, setEvents] = useState(() => loadEvents());
  const historyEvents = [
    { id: 'PH-1201', name: 'Expired SOS - Rahul', lat: 31.1051, lng: 77.1711, ts: Date.now() - 1000 * 60 * 90 },
    { id: 'PH-1202', name: 'Expired SOS - Anita', lat: 31.1064, lng: 77.1760, ts: Date.now() - 1000 * 60 * 60 * 18 },
  ];
  const mapRef = useRef(null);
  const [mapSize, setMapSize] = useState({ width: 0, height: 0 });
  const cardsRef = useRef({});

  // Shimla-ish bounds (same as police for parity)
  const bounds = useMemo(() => ({ minLat: 31.1015, maxLat: 31.1085, minLng: 77.1685, maxLng: 77.1785 }), []);

  const projectToMap = (lat, lng, width, height) => {
    const x = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * width;
    const y = (1 - (lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * height;
    return { x, y };
  };

  // Listen to storage events (SOS from apphome.jsx) and also poll every few seconds
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'travya_sos_events') {
        setEvents(loadEvents());
      }
    };
    window.addEventListener('storage', onStorage);
    const iv = setInterval(() => setEvents(loadEvents()), 3000);
    return () => { window.removeEventListener('storage', onStorage); clearInterval(iv); };
  }, []);

  // Map size observer
  useEffect(() => {
    const el = mapRef.current; if (!el) return;
    const update = () => setMapSize({ width: el.clientWidth, height: el.clientHeight });
    update();
    const ro = new ResizeObserver(update); ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const onPinClick = (id) => {
    setSelectedId(id);
    const el = cardsRef.current[id];
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div style={styles.page}>
      <Navbar/>
      <section style={styles.heroSection}>
        <div style={styles.bgBase} />
        <div style={styles.bgBlobLeft} />
        <div style={styles.bgBlobRight} />
      </section>
      <div style={styles.container}>
        <header style={styles.header}>
          <div>
            <div style={styles.badge}>Public Dashboard</div>
            <h1 style={styles.title}>Live SOS from Nearby Tourists</h1>
            <div style={styles.sub}>Only verified locals can view and respond to alerts.</div>
          </div>
          <div style={styles.tabGroup}>
            <button style={{ ...styles.tabBtn, ...(activeTab === 'alerts' ? styles.tabActive : {}) }} onClick={() => setActiveTab('alerts')}>Alerts</button>
            <button style={{ ...styles.tabBtn, ...(activeTab === 'map' ? styles.tabActive : {}) }} onClick={() => setActiveTab('map')}>Map</button>
            <button style={{ ...styles.tabBtn, ...(activeTab === 'history' ? styles.tabActive : {}) }} onClick={() => setActiveTab('history')}>History</button>
          </div>
        </header>

        {/* Live SOS banner + list */}
        {events.length > 0 && (
          <div style={styles.sosWrap}>
            <div style={styles.sosBanner}>
              <div style={styles.sosDot} />
              <div style={{ flex: 1 }}>
                <div style={styles.sosTitle}>Live SOS</div>
                <div style={styles.sosMeta}>Most recent at {new Date(events[events.length - 1].ts).toLocaleTimeString()}</div>
              </div>
              <a href={`https://www.google.com/maps?q=${events[events.length - 1].lat},${events[events.length - 1].lng}`} target="_blank" rel="noreferrer" style={styles.sosLink}>Open Map</a>
            </div>
            <div style={styles.sosList}>
              {events.slice(-5).reverse().map((ev) => (
                <div key={ev.id} style={styles.sosItem} onClick={() => { setActiveTab('map'); setSelectedId(ev.id); }}>
                  <div style={styles.sosTime}>{new Date(ev.ts).toLocaleTimeString()}</div>
                  <div style={{ flex: 1 }}>
                    <div style={styles.sosName}>{ev.name || 'Tourist'} • {ev.phone || ''}</div>
                    <div style={styles.sosCoords}>{Number(ev.lat).toFixed(5)}, {Number(ev.lng).toFixed(5)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'alerts' && (
          <div style={styles.grid}>
            {events.length === 0 && (
              <div style={styles.empty}>No live SOS yet. This will populate when a tourist presses SOS.</div>
            )}
            {events.map((ev) => (
              <div key={ev.id} ref={(el) => (cardsRef.current[ev.id] = el)} style={{ ...styles.card, outline: selectedId === ev.id ? `2px solid ${theme.colors.primary}` : 'none' }} onClick={() => setSelectedId(ev.id)}>
                <div style={styles.cardHeader}>
                  <div style={{ ...styles.dot, background: theme.colors.error }} />
                  <div>
                    <div style={styles.cardTitle}>SOS - {ev.name || 'Unknown Tourist'}</div>
                    <div style={styles.cardSub}>Time: {new Date(ev.ts).toLocaleTimeString()} • {ev.phone || '+91 xxxxxxxx'}</div>
                  </div>
                </div>
                <div style={styles.coordsRow}>
                  <div>
                    <div style={styles.coordLabel}>Latitude</div>
                    <div style={styles.coordValue}>{Number(ev.lat).toFixed(6)}°</div>
                  </div>
                  <div>
                    <div style={styles.coordLabel}>Longitude</div>
                    <div style={styles.coordValue}>{Number(ev.lng).toFixed(6)}°</div>
                  </div>
                </div>
                <div style={styles.actionsRow}>
                  <a href={`https://www.google.com/maps?q=${ev.lat},${ev.lng}`} target="_blank" rel="noreferrer" style={styles.linkBtn}>Open in Maps</a>
                  <button style={styles.primaryBtn}>Offer Help</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'map' && (
          <div style={styles.mapCard}>
            <div style={styles.mapHeader}>Live SOS Map (static image)</div>
            <div style={styles.mapCanvas} ref={mapRef}>
              {events.map((ev) => {
                const { x, y } = projectToMap(Number(ev.lat), Number(ev.lng), mapSize.width || 900, mapSize.height || 380);
                return (
                  <button key={ev.id} title={`SOS: ${ev.name || 'Tourist'}`} onClick={() => onPinClick(ev.id)} style={{ ...styles.pin, left: x, top: y, width: 18, height: 18, background: theme.colors.error, boxShadow: '0 0 0 8px rgba(239,68,68,0.18)', transform: selectedId === ev.id ? 'translate(-50%, -50%) scale(1.2)' : 'translate(-50%, -50%)' }} />
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div style={styles.grid}>
            {historyEvents.map((ev) => (
              <div key={ev.id} style={{ ...styles.card, opacity: 0.6 }}>
                <div style={styles.cardHeader}>
                  <div style={{ ...styles.dot, background: '#9CA3AF' }} />
                  <div>
                    <div style={styles.cardTitle}>{ev.name}</div>
                    <div style={styles.cardSub}>Expired • {new Date(ev.ts).toLocaleString()}</div>
                  </div>
                </div>
                <div style={styles.coordsRow}>
                  <div>
                    <div style={styles.coordLabel}>Latitude</div>
                    <div style={styles.coordValue}>{ev.lat.toFixed(6)}°</div>
                  </div>
                  <div>
                    <div style={styles.coordLabel}>Longitude</div>
                    <div style={styles.coordValue}>{ev.lng.toFixed(6)}°</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function loadEvents() {
  try {
    const raw = localStorage.getItem('travya_sos_events');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.slice(-20); // keep recent 20
    return [];
  } catch (_) {
    return [];
  }
}

const styles = {
  page: { minHeight: '100vh', background: 'linear-gradient(180deg, #EEF4FF 0%, #FFFFFF 35%, #FFFFFF 100%)', color: theme.colors.text, paddingBottom: 80, overflowX: 'hidden' },
  heroSection: { position: 'relative' },
  bgBase: { position: 'absolute', inset: 0, zIndex: 0, background: 'linear-gradient(135deg, #F0F6FF 0%, #FFFFFF 60%, #FFF4F6 100%)' },
  bgBlobLeft: { position: 'absolute', top: -120, left: -120, width: 360, height: 360, borderRadius: 9999, background: 'rgba(125, 211, 252, 0.25)', filter: 'blur(60px)', zIndex: 0 },
  bgBlobRight: { position: 'absolute', bottom: -140, right: -140, width: 380, height: 380, borderRadius: 9999, background: 'rgba(251, 146, 60, 0.25)', filter: 'blur(70px)', zIndex: 0 },
  container: { maxWidth: 920, margin: '0 auto', padding: 20, marginTop: 64 },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, gap: 12, flexWrap: 'wrap' },
  badge: { display: 'inline-block', background: '#fff', border: '1px solid #E6EAF2', borderRadius: 999, padding: '6px 10px', color: theme.colors.textSecondary, fontSize: 12 },
  title: { margin: 0, marginTop: 8, fontSize: 22, fontWeight: 700 },
  sub: { color: theme.colors.textSecondary, marginTop: 4, fontSize: 12 },
  tabGroup: { display: 'flex', gap: 8 },
  tabBtn: { background: '#fff', border: '1px solid #E6EAF2', padding: '8px 12px', borderRadius: 10, cursor: 'pointer', color: theme.colors.textSecondary },
  tabActive: { color: theme.colors.primary, borderColor: theme.colors.primary, background: '#EEF4FF' },

  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 },
  card: { background: '#fff', border: '1px solid #E6EAF2', borderRadius: 14, padding: 14, boxShadow: '0 8px 24px rgba(0,0,0,0.06)', cursor: 'pointer' },
  cardHeader: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 },
  dot: { width: 14, height: 14, borderRadius: 999 },
  cardTitle: { fontWeight: 700 },
  cardSub: { color: theme.colors.textSecondary, fontSize: 12, marginTop: 2 },
  coordsRow: { display: 'flex', justifyContent: 'space-between', marginTop: 10 },
  coordLabel: { fontSize: 12, color: theme.colors.textSecondary },
  coordValue: { fontWeight: 700, marginTop: 2 },
  actionsRow: { display: 'flex', justifyContent: 'space-between', gap: 10, marginTop: 12 },
  linkBtn: { padding: '8px 10px', borderRadius: 10, border: '1px solid #E6EAF2', background: '#fff', color: theme.colors.text },
  primaryBtn: { padding: '8px 10px', borderRadius: 10, border: '1px solid #2563EB22', background: '#2563EB', color: '#fff' },

  mapCard: { background: '#fff', border: '1px solid #E6EAF2', borderRadius: 16, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.06)' },
  mapHeader: { padding: 14, borderBottom: '1px solid #E6EAF2', fontWeight: 700 },
  mapCanvas: { position: 'relative', width: '100%', height: 380, background: "url('https://maps.wikimedia.org/img/osm-intl,13,77.2090,28.6139,900x380.png') center/cover no-repeat, linear-gradient(135deg, #E5EEFF, #F8FBFF)", overflow: 'hidden' },
  pin: { position: 'absolute', width: 14, height: 14, borderRadius: 999, border: '2px solid #fff' },
};


