import React, { useEffect, useMemo, useRef, useState } from 'react';
import Navbar from './navbar';

// Light theme matching apphome.jsx
const theme = {
  colors: {
    background: '#F3F6FF',
    backgroundAlt: '#FFFFFF',
    surface: '#FFFFFF',
    text: '#0F172A',
    textSecondary: '#5B6472',
    primary: '#2563EB',
    success: '#16A34A',
    warning: '#F59E0B',
    error: '#EF4444',
  },
  spacing: { xs: 6, sm: 12, md: 16, lg: 20 },
  typography: {
    h1: { fontSize: 24, fontWeight: 700 },
    h2: { fontSize: 18, fontWeight: 700 },
    body: { fontSize: 14, fontWeight: 400 },
    caption: { fontSize: 12, fontWeight: 400 },
  },
};

// Bounds around Shimla for mock projection

export default function PoliceDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedId, setSelectedId] = useState(null);
  const cardsRef = useRef({});
  const mapRef = useRef(null);
  const mapSectionRef = useRef(null);
  const [mapSize, setMapSize] = useState({ width: 0, height: 0 });
  const [tourists, setTourists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sosEvents, setSosEvents] = useState(() => loadEvents());
  const [elapsed, setElapsed] = useState('00:00');
  const [showEfirs, setShowEfirs] = useState(false);
  const [passportQuery, setPassportQuery] = useState('');
  const [lookup, setLookup] = useState({ loading: false, error: '', data: null });
  const asBool = (v) => v === true || v === 'true' || v === 't' || v === 1 || v === '1';
  const historyEvents = [
    { id: 'H-0901', name: 'Expired SOS - Neeraj', phone: '+91 98xxxxxx21', lat: 31.1049, lng: 77.1712, ts: Date.now() - 1000 * 60 * 60 * 5 },
    { id: 'H-0902', name: 'Expired SOS - Mira', phone: '+91 98xxxxxx22', lat: 31.1061, lng: 77.1744, ts: Date.now() - 1000 * 60 * 60 * 26 },
  ];

  // Map bounds around Shimla (rough box)
  const bounds = useMemo(() => ({
    minLat: 31.1015,
    maxLat: 31.1085,
    minLng: 77.1685,
    maxLng: 77.1785,
  }), []);

  // Fetch tourists dynamically from backend and assign pseudo coordinates within bounds
  useEffect(() => {
    async function fetchList() {
      try {
        setLoading(true);
        const resp = await fetch('http://localhost:5000/api/tourists');
        const json = await resp.json();
        const list = Array.isArray(json.tourists) ? json.tourists : [];
        const withPos = list.map((t) => {
          const idStr = String(t.id);
          let hash = 0; for (let i = 0; i < idStr.length; i++) hash = (hash * 31 + idStr.charCodeAt(i)) >>> 0;
          const fx = (hash % 1000) / 1000; const fy = ((hash >> 10) % 1000) / 1000;
          const lat = bounds.minLat + fy * (bounds.maxLat - bounds.minLat);
          const lng = bounds.minLng + fx * (bounds.maxLng - bounds.minLng);
          const zone = ((hash >> 20) % 3) === 0 ? 'danger' : 'safe';
          return {
            id: t.id,
            name: t.fullname || t.name || 'Tourist',
            phone: t.phoneno || t.phone || '',
            wallet: t.wallet_address || '',
            lat,
            lng,
            zone,
            verified: asBool(t.verified),
            documentno: t.documentno,
          };
        });
        setTourists(withPos);
      } catch (_) {
        setTourists([]);
      } finally {
        setLoading(false);
      }
    }
    fetchList();
  }, [bounds]);

  // Refetch when switching to Verify to ensure latest unverified cards show
  useEffect(() => {
    if (activeTab !== 'verify') return;
    (async () => {
      try {
        setLoading(true);
        const resp = await fetch('http://localhost:5000/api/tourists');
        const json = await resp.json();
        const list = Array.isArray(json.tourists) ? json.tourists : [];
        const mapped = list.map((t) => {
          const idStr = String(t.id);
          let hash = 0; for (let i = 0; i < idStr.length; i++) hash = (hash * 31 + idStr.charCodeAt(i)) >>> 0;
          const fx = (hash % 1000) / 1000; const fy = ((hash >> 10) % 1000) / 1000;
          const lat = bounds.minLat + fy * (bounds.maxLat - bounds.minLat);
          const lng = bounds.minLng + fx * (bounds.maxLng - bounds.minLng);
          const zone = ((hash >> 20) % 3) === 0 ? 'danger' : 'safe';
          return { id: t.id, name: t.fullname || 'Tourist', phone: t.phoneno || '', lat, lng, zone, verified: asBool(t.verified), documentno: t.documentno };
        });
        setTourists(mapped);
      } finally { setLoading(false); }
    })();
  }, [activeTab, bounds]);

  const projectToMap = (lat, lng, width, height) => {
    // Simple linear projection within bounds → x,y in px
    const x = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * width;
    const y = (1 - (lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * height;
    return { x, y };
  };

  // Observe map size to position pins correctly on mobile
  useEffect(() => {
    const el = mapRef.current;
    if (!el) return;
    const update = () => setMapSize({ width: el.clientWidth, height: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener('orientationchange', update);
    return () => {
      ro.disconnect();
      window.removeEventListener('orientationchange', update);
    };
  }, []);

  // Listen to storage updates for SOS events
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'travya_sos_events') setSosEvents(loadEvents());
    };
    window.addEventListener('storage', onStorage);
    const iv = setInterval(() => setSosEvents(loadEvents()), 3000);
    return () => { window.removeEventListener('storage', onStorage); clearInterval(iv); };
  }, []);

  // Stopwatch for most recent SOS
  useEffect(() => {
    const recent = getMostRecentSOS(sosEvents);
    const update = () => setElapsed(formatDuration(Date.now() - recent.ts));
    update();
    const iv = setInterval(update, 1000);
    return () => clearInterval(iv);
  }, [sosEvents]);

  // When switching to map tab, scroll map into view
  useEffect(() => {
    if (activeTab === 'map') {
      requestAnimationFrame(() => {
        mapSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }, [activeTab]);

  const resolveSOS = (id) => {
    try {
      const list = loadEvents();
      const next = list.filter((e) => e.id !== id);
      // If not found (e.g., dummy fallback), clear all
      const finalList = next.length === list.length ? [] : next;
      localStorage.setItem('travya_sos_events', JSON.stringify(finalList));
      setSosEvents(finalList);
    } catch (_) {}
  };

  const onPinClick = (id) => {
    setSelectedId(id);
    const el = cardsRef.current[id];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.animate?.([{ boxShadow: '0 0 0 rgba(0,0,0,0)' }, { boxShadow: '0 0 0 rgba(0,0,0,0)' }], { duration: 300 });
    }
  };

  const onCardClick = (id) => {
    setSelectedId(id);
    setActiveTab('map');
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
            <div style={styles.badge}>Police Dashboard</div>
            <h1 style={styles.title}>Tourist Tracking - Shimla</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <div style={styles.tabGroup}>
              <button style={{ ...styles.tabBtn, ...(activeTab === 'overview' ? styles.tabActive : {}) }} onClick={() => setActiveTab('overview')}>Overview</button>
              <button style={{ ...styles.tabBtn, ...(activeTab === 'map' ? styles.tabActive : {}) }} onClick={() => setActiveTab('map')}>Map</button>
              <button style={{ ...styles.tabBtn, ...(activeTab === 'history' ? styles.tabActive : {}) }} onClick={() => setActiveTab('history')}>History</button>
              <button style={{ ...styles.tabBtn, ...(activeTab === 'verify' ? styles.tabActive : {}) }} onClick={() => setActiveTab('verify')}>Verify</button>
              <a href="/report" style={{ ...styles.tabBtn, textDecoration: 'none' }}>Report</a>
            </div>
          </div>
        </header>

        {/* Live SOS banner + list (hidden in Verify tab) */}
        {activeTab !== 'verify' && sosEvents.length > 0 && (
          <div style={styles.sosWrap}>
            <div style={styles.sosBanner}>
              <div style={styles.sosDot} />
              <div style={{ flex: 1 }}>
                <div style={styles.sosTitle}>Live SOS</div>
                <div style={styles.sosMeta}>Most recent at {new Date(sosEvents[sosEvents.length - 1].ts).toLocaleTimeString()}</div>
              </div>
              <a href={`https://www.google.com/maps?q=${sosEvents[sosEvents.length - 1].lat},${sosEvents[sosEvents.length - 1].lng}`} target="_blank" rel="noreferrer" style={styles.sosLink}>Open Map</a>
            </div>
            <div style={styles.sosList}>
              {sosEvents.slice(-5).reverse().map((ev) => (
                <div key={ev.id} style={styles.sosItem} onClick={() => { setActiveTab('map'); setSelectedId(ev.id); }}>
                  <div style={styles.sosTime}>{new Date(ev.ts).toLocaleTimeString()}</div>
                  <div style={{ flex: 1 }}>
                    <div style={styles.sosName}>{ev.name || 'Tourist'} • {ev.phone || ''}</div>
                    <div style={styles.sosCoords}>{Number(ev.lat).toFixed(5)}, {Number(ev.lng).toFixed(5)}</div>
                  </div>
                  <a href={`https://www.google.com/maps?q=${ev.lat},${ev.lng}`} target="_blank" rel="noreferrer" style={styles.linkBtn}>Maps</a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Priority SOS card (hidden in Verify tab) */}
        {activeTab !== 'verify' && (
        <div style={styles.priorityCard}>
          <div style={styles.priorityHeader}>
            <div style={styles.priorityBadge}>Priority • SOS</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                style={styles.stopBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  const r = getMostRecentSOS(sosEvents);
                  resolveSOS(r.id);
                }}
              >Stop</button>
              <div style={styles.priorityTimer}>⏱ {elapsed}</div>
            </div>
          </div>
          {(() => { const r = getMostRecentSOS(sosEvents); return (
            <div
              style={styles.priorityBody}
              onClick={() => { setActiveTab('map'); setSelectedId(r.id); }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={styles.priorityAvatar}>🆘</div>
                <div>
                  <div style={styles.priorityName}>{r.name || 'Tourist'}</div>
                  <div style={styles.priorityMeta}>At {new Date(r.ts).toLocaleTimeString()} • {r.phone || '+91 xxxxxxxx'}</div>
                </div>
              </div>
              <div style={styles.priorityCoords}>{Number(r.lat).toFixed(5)}, {Number(r.lng).toFixed(5)}</div>
            </div>
          ); })()}
        </div>
        )}

        {/* eFIRs quick access row (separate from tabs) moved below cards */}

        {activeTab === 'overview' && (
          <div style={styles.grid}>
            {(loading ? Array.from({ length: 4 }).map((_, i) => ({ id: 's'+i, name: 'Loading...', phone: '', lat: 31.104, lng: 77.173, zone: 'safe', skeleton: true })) : tourists.filter(t => t.verified)).map((t) => (
              <div
                key={t.id}
                ref={(el) => (cardsRef.current[t.id] = el)}
                style={{
                  ...styles.card,
                  outline: selectedId === t.id ? `2px solid ${t.zone === 'danger' ? theme.colors.error : theme.colors.success}` : 'none',
                }}
                onClick={() => onCardClick(t.id)}
              >
                <div style={styles.cardHeader}>
                  <div style={{ ...styles.dot, background: t.skeleton ? '#E5E7EB' : (t.zone === 'danger' ? theme.colors.error : theme.colors.success) }} />
                  <div>
                    <div style={styles.cardTitle}>{t.name}</div>
                    <div style={styles.cardSub}>ID: {t.id} • {t.phone}</div>
                    {t.wallet && <div style={{ ...styles.cardSub, marginTop: 2 }}>Wallet: {t.wallet.slice(0, 6)}...{t.wallet.slice(-4)}</div>}
                  </div>
                </div>
                <div style={styles.coordsRow}>
                  <div>
                    <div style={styles.coordLabel}>Latitude</div>
                    <div style={styles.coordValue}>{Number(t.lat).toFixed(6)}°</div>
                  </div>
                  <div>
                    <div style={styles.coordLabel}>Longitude</div>
                    <div style={styles.coordValue}>{Number(t.lng).toFixed(6)}°</div>
                  </div>
                </div>
                {!t.skeleton && <div style={styles.zonePill(t.zone)}>{t.zone === 'danger' ? 'Protected/Restricted Zone' : 'Safe Zone'}</div>}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
                  <div style={{ fontSize: 12, color: theme.colors.textSecondary }}>📍 {Number(t.lat).toFixed(5)}, {Number(t.lng).toFixed(5)}</div>
                  {!t.skeleton && <a href={`https://www.google.com/maps?q=${t.lat},${t.lng}`} target="_blank" rel="noreferrer" style={styles.linkBtn}>Open in Maps</a>}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'verify' && (
          <div style={{ ...styles.card, marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'end', gap: 8, flexWrap: 'wrap' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Verify Tourist by Passport</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input value={passportQuery} onChange={(e) => setPassportQuery(e.target.value)} placeholder="Enter Passport / Document No" style={styles.input} />
                  <button style={styles.primaryBtn} onClick={async () => {
                    try {
                      setLookup({ loading: true, error: '', data: null });
                      const resp = await fetch(`http://localhost:5000/api/tourists/passport/${encodeURIComponent(passportQuery)}`);
                      const json = await resp.json();
                      if (!resp.ok) throw new Error(json.error || 'Lookup failed');
                      setLookup({ loading: false, error: '', data: json.tourist });
                    } catch (e) {
                      setLookup({ loading: false, error: e.message, data: null });
                    }
                  }}>Search</button>
                  <button style={styles.primaryBtn} onClick={async () => {
                    try {
                      setLoading(true);
                      const resp = await fetch('http://localhost:5000/api/tourists');
                      const json = await resp.json();
                      const list = Array.isArray(json.tourists) ? json.tourists : [];
                      const mapped = list.map((t) => {
                        const idStr = String(t.id);
                        let hash = 0; for (let i = 0; i < idStr.length; i++) hash = (hash * 31 + idStr.charCodeAt(i)) >>> 0;
                        const fx = (hash % 1000) / 1000; const fy = ((hash >> 10) % 1000) / 1000;
                        const lat = bounds.minLat + fy * (bounds.maxLat - bounds.minLat);
                        const lng = bounds.minLng + fx * (bounds.maxLng - bounds.minLng);
                        const zone = ((hash >> 20) % 3) === 0 ? 'danger' : 'safe';
                        return { id: t.id, name: t.fullname || 'Tourist', phone: t.phoneno || '', lat, lng, zone, verified: !!t.verified, documentno: t.documentno };
                      });
                      setTourists(mapped);
                    } finally { setLoading(false); }
                  }}>Refresh</button>
                </div>
              </div>
              {lookup.loading && <div>Searching…</div>}
              {lookup.error && <div style={{ color: theme.colors.error }}>{lookup.error}</div>}
            </div>

            {lookup.data && (
              <div style={{ marginTop: 12 }}>
                <div style={{ ...styles.card, boxShadow: 'none', border: '1px solid #E6EAF2' }}>
                  <div style={styles.cardHeader}>
                    <div style={{ ...styles.dot, background: lookup.data.verified ? theme.colors.success : theme.colors.warning }} />
                    <div>
                      <div style={styles.cardTitle}>{lookup.data.fullname}</div>
                      <div style={styles.cardSub}>Passport: {lookup.data.documentno} • {lookup.data.nationality}</div>
                    </div>
                  </div>
                  <div style={styles.coordsRow}>
                    <div>
                      <div style={styles.coordLabel}>Email</div>
                      <div style={styles.coordValue}>{lookup.data.email}</div>
                    </div>
                    <div>
                      <div style={styles.coordLabel}>Phone</div>
                      <div style={styles.coordValue}>{lookup.data.phoneno}</div>
                    </div>
                    <div>
                      <div style={styles.coordLabel}>Check-in</div>
                      <div style={styles.coordValue}>{String(lookup.data.checkindate).slice(0,10)}</div>
                    </div>
                    <div>
                      <div style={styles.coordLabel}>Check-out</div>
                      <div style={styles.coordValue}>{String(lookup.data.checkoutdate).slice(0,10)}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                    <div style={styles.zonePill(lookup.data.verified ? 'safe' : 'danger')}>{lookup.data.verified ? 'Verified' : 'Not Verified'}</div>
                    {!lookup.data.verified && (
                      <button style={styles.glassBtn} onClick={async () => {
                        try {
                          const resp = await fetch('http://localhost:5000/api/tourists/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: lookup.data.id, documentNo: lookup.data.documentno }) });
                          const json = await resp.json();
                          if (!resp.ok) throw new Error(json.error || 'Verify failed');
                          setLookup((prev) => prev.data ? { loading: false, error: '', data: { ...prev.data, verified: true } } : prev);
                          // Refresh list to move card to Overview
                          try {
                            setLoading(true);
                            const resp2 = await fetch('http://localhost:5000/api/tourists');
                            const json2 = await resp2.json();
                            const list2 = Array.isArray(json2.tourists) ? json2.tourists : [];
                            const mapped = list2.map((t) => {
                              const idStr = String(t.id);
                              let hash = 0; for (let i = 0; i < idStr.length; i++) hash = (hash * 31 + idStr.charCodeAt(i)) >>> 0;
                              const fx = (hash % 1000) / 1000; const fy = ((hash >> 10) % 1000) / 1000;
                              const lat = bounds.minLat + fy * (bounds.maxLat - bounds.minLat);
                              const lng = bounds.minLng + fx * (bounds.maxLng - bounds.minLng);
                              const zone = ((hash >> 20) % 3) === 0 ? 'danger' : 'safe';
                              return { id: t.id, name: t.fullname || 'Tourist', phone: t.phoneno || '', lat, lng, zone, verified: !!t.verified, documentno: t.documentno };
                            });
                            setTourists(mapped);
                          } finally { setLoading(false); }
                        } catch (e) {
                          alert(e.message);
                        }
                      }}>Verify Tourist</button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'verify' && (
          <div style={{ marginTop: 12 }}>
            <div style={styles.grid}>
              {tourists.filter(t => !t.verified).map((t) => (
                <div key={t.id} style={styles.card}>
                  <div style={styles.cardHeader}>
                    <div style={{ ...styles.dot, background: theme.colors.warning }} />
                    <div>
                      <div style={styles.cardTitle}>{t.name}</div>
                      <div style={styles.cardSub}>Passport: {t.documentno || '—'} • Phone: {t.phone || '—'}</div>
                    </div>
                  </div>
                  <div style={styles.coordsRow}>
                    <div>
                      <div style={styles.coordLabel}>Latitude</div>
                      <div style={styles.coordValue}>{Number(t.lat).toFixed(6)}°</div>
                    </div>
                    <div>
                      <div style={styles.coordLabel}>Longitude</div>
                      <div style={styles.coordValue}>{Number(t.lng).toFixed(6)}°</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                    <div style={styles.zonePill('danger')}>Not Verified</div>
                    <button style={styles.glassBtn} onClick={async () => {
                      try {
                        const resp = await fetch('http://localhost:5000/api/tourists/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: t.id, documentNo: t.documentno }) });
                        const json = await resp.json();
                        if (!resp.ok) throw new Error(json.details || json.error || 'Verify failed');
                        // update state optimistically
                        setTourists((prev) => prev.map((x) => x.id === t.id ? { ...x, verified: true } : x));
                      } catch (e) { alert(e.message); }
                    }}>Verify</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab !== 'verify' && (
        <div style={styles.efirBar}>
          <div style={styles.efirInfo}>Auto eFIRs due to inactivity</div>
          <button style={styles.efirBtn} onClick={() => setShowEfirs((v) => !v)}>{showEfirs ? 'Hide eFIRs' : 'View eFIRs'}</button>
        </div>
        )}

        {activeTab === 'map' && (
          <div ref={mapSectionRef}>
            <div style={styles.mapCard}>
              <div style={styles.mapHeader}>Shimla Map (mock)</div>
              <div style={styles.mapCanvas} ref={mapRef}>
                {/* Dot layer */}
                {tourists.map((t) => {
                  const width = mapSize.width || 900;
                  const height = mapSize.height || 380;
                  const { x, y } = projectToMap(t.lat, t.lng, width, height);
                  return (
                    <button
                      key={t.id}
                      title={`${t.name} • ${t.zone}`}
                      onClick={() => onPinClick(t.id)}
                      style={{
                        ...styles.pin,
                        left: x,
                        top: y,
                        background: t.zone === 'danger' ? theme.colors.error : theme.colors.success,
                        transform: selectedId === t.id ? 'translate(-50%, -50%) scale(1.2)' : 'translate(-50%, -50%) scale(1)',
                        boxShadow: selectedId === t.id ? '0 0 0 6px rgba(37,99,235,0.18)' : '0 2px 8px rgba(0,0,0,0.18)'
                      }}
                    />
                  );
                })}
                {/* SOS pins (distinct red, larger) */}
                {sosEvents.map((ev) => {
                  const width = mapSize.width || 900;
                  const height = mapSize.height || 380;
                  const { x, y } = projectToMap(Number(ev.lat), Number(ev.lng), width, height);
                  return (
                    <button
                      key={ev.id}
                      title={`SOS: ${ev.name || 'Tourist'}`}
                      onClick={() => onPinClick(ev.id)}
                      style={{
                        ...styles.pin,
                        left: x,
                        top: y,
                        width: 18,
                        height: 18,
                        background: theme.colors.error,
                        boxShadow: '0 0 0 8px rgba(239,68,68,0.18)',
                        transform: selectedId === ev.id ? 'translate(-50%, -50%) scale(1.2)' : 'translate(-50%, -50%)'
                      }}
                    />
                  );
                })}
              </div>
              <div style={styles.legendRow}>
                <div style={styles.legendItem}><span style={{ ...styles.legendDot, background: theme.colors.success }} /> Safe cluster</div>
                <div style={styles.legendItem}><span style={{ ...styles.legendDot, background: theme.colors.error }} /> Restricted area</div>
                <div style={styles.legendItem}><span style={{ ...styles.legendDot, background: theme.colors.error, width: 14, height: 14 }} /> SOS</div>
              </div>
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

        {showEfirs && (
          <div style={styles.grid}>
            {[
              { id: 'EFIR-2025-0012', tourist: 'Arjun Verma', phone: '+91 98xxxxxx45', lastActivity: 'Last seen: 18:35 near Ridge, Shimla', filedAt: 'Today, 19:05', status: 'open' },
              { id: 'EFIR-2025-0013', tourist: 'Neha Patel', phone: '+91 98xxxxxx76', lastActivity: 'Last seen: 17:10 near Mall Road', filedAt: 'Today, 18:00', status: 'open' },
              { id: 'EFIR-2025-0014', tourist: 'Kabir Singh', phone: '+91 98xxxxxx11', lastActivity: 'Last seen: Yesterday 22:40, Jakhu Hill', filedAt: 'Today, 09:15', status: 'closed' },
              { id: 'EFIR-2025-0015', tourist: 'Sara Khan', phone: '+91 98xxxxxx04', lastActivity: 'Last seen: Yesterday 21:20, Lakkar Bazar', filedAt: 'Today, 08:30', status: 'closed' },
            ].map((e) => (
              <div key={e.id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <div style={{ fontWeight: 700 }}>{e.id}</div>
                  <div style={styles.statusPill(e.status)}>{e.status === 'closed' ? 'eFIR Closed' : 'Open'}</div>
                </div>
                <div style={styles.line}><span style={styles.label}>Tourist</span><span style={styles.value}>{e.tourist}</span></div>
                <div style={styles.line}><span style={styles.label}>Phone</span><span style={styles.value}>{e.phone}</span></div>
                <div style={styles.line}><span style={styles.label}>Last Activity</span><span style={styles.value}>{e.lastActivity}</span></div>
                <div style={styles.line}><span style={styles.label}>Filed</span><span style={styles.value}>{e.filedAt}</span></div>
                <div style={styles.actionsRow}>
                  <a href="#" onClick={(ev) => ev.preventDefault()} style={styles.linkBtn}>View details</a>
                  <a href={`https://www.google.com/maps?q=31.105,77.173`} target="_blank" rel="noreferrer" style={styles.primaryBtn}>{e.status === 'closed' ? 'Case Solved' : 'Open in Maps'}</a>
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
    if (Array.isArray(parsed)) return parsed.slice(-20);
    return [];
  } catch (_) {
    return [];
  }
}

function getMostRecentSOS(list) {
  if (!list || list.length === 0) {
    // fallback dummy entry if none exists
    return { id: 'D-000', name: 'Demo Tourist', phone: '+91 98xxxxxx99', lat: 31.105, lng: 77.173, ts: Date.now() - 30 * 1000 };
  }
  return list[list.length - 1];
}

function formatDuration(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = String(Math.floor(total / 60)).padStart(2, '0');
  const s = String(total % 60).padStart(2, '0');
  return `${m}:${s}`;
}

const styles = {
  page: {
    minHeight: '100vh',
    background: `linear-gradient(180deg, #EEF4FF 0%, #FFFFFF 35%, #FFFFFF 100%)`,
    color: theme.colors.text,
    paddingBottom: 80,
    overflowX: 'hidden',
  },
  heroSection: { position: 'relative' },
  bgBase: { position: 'absolute', inset: 0, zIndex: 0, background: 'linear-gradient(135deg, #F0F6FF 0%, #FFFFFF 60%, #FFF4F6 100%)' },
  bgBlobLeft: { position: 'absolute', top: -120, left: -120, width: 360, height: 360, borderRadius: 9999, background: 'rgba(125, 211, 252, 0.25)', filter: 'blur(60px)', zIndex: 0 },
  bgBlobRight: { position: 'absolute', bottom: -140, right: -140, width: 380, height: 380, borderRadius: 9999, background: 'rgba(251, 146, 60, 0.25)', filter: 'blur(70px)', zIndex: 0 },
  container: { maxWidth: 920, margin: '0 auto', padding: theme.spacing.lg, marginTop: 64 },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.spacing.md },
  badge: { display: 'inline-block', background: '#fff', border: '1px solid #E6EAF2', borderRadius: 999, padding: '6px 10px', color: theme.colors.textSecondary, fontSize: 12 },
  title: { margin: 0, marginTop: 8, fontSize: theme.typography.h1.fontSize, fontWeight: theme.typography.h1.fontWeight },
  tabGroup: { display: 'flex', gap: 8 },
  tabBtn: { background: '#fff', border: '1px solid #E6EAF2', padding: '8px 12px', borderRadius: 10, cursor: 'pointer', color: theme.colors.textSecondary },
  tabActive: { color: theme.colors.primary, borderColor: theme.colors.primary, background: '#EEF4FF' },
  efirBar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: 12, background: '#fff', border: '1px solid #E6EAF2', borderRadius: 12, marginBottom: 12 },
  efirInfo: { fontSize: 12, color: theme.colors.textSecondary },
  efirBtn: { padding: '8px 12px', borderRadius: 10, border: '1px solid #2563EB22', background: '#2563EB', color: '#fff', textDecoration: 'none' },

  sosWrap: { background: '#fff', border: '1px solid #E6EAF2', borderRadius: 12, padding: 12, marginBottom: 12 },
  sosBanner: { display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 10, borderBottom: '1px solid #E6EAF2' },
  sosDot: { width: 10, height: 10, borderRadius: 999, background: '#EF4444', boxShadow: '0 0 0 8px rgba(239,68,68,0.12)' },
  sosTitle: { fontWeight: 700 },
  sosMeta: { fontSize: 12, color: theme.colors.textSecondary },
  sosLink: { fontSize: 12, color: theme.colors.primary },
  sosList: { display: 'grid', gap: 8, marginTop: 10 },
  sosItem: { display: 'flex', gap: 10, alignItems: 'center', padding: 8, borderRadius: 10, background: '#F8FAFC', cursor: 'pointer' },
  sosTime: { fontSize: 12, color: theme.colors.textSecondary, minWidth: 84 },
  sosName: { fontWeight: 600 },
  sosCoords: { fontSize: 12, color: theme.colors.textSecondary },

  priorityCard: { background: '#FFF1F2', border: '1px solid #FECACA', borderRadius: 14, padding: 12, marginBottom: 12, cursor: 'pointer' },
  priorityHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  priorityBadge: { fontSize: 12, fontWeight: 700, color: '#B91C1C' },
  priorityTimer: { fontWeight: 700, color: '#B91C1C' },
  priorityBody: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  priorityAvatar: { width: 36, height: 36, borderRadius: 10, background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  priorityName: { fontWeight: 700 },
  priorityMeta: { fontSize: 12, color: theme.colors.textSecondary },
  priorityCoords: { fontWeight: 700 },

  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: theme.spacing.sm },
  card: { background: '#fff', border: '1px solid #E6EAF2', borderRadius: 14, padding: theme.spacing.md, boxShadow: '0 8px 24px rgba(0,0,0,0.06)', cursor: 'pointer' },
  cardHeader: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 },
  dot: { width: 14, height: 14, borderRadius: 999 },
  cardTitle: { fontWeight: 700 },
  cardSub: { color: theme.colors.textSecondary, fontSize: 12, marginTop: 2 },
  coordsRow: { display: 'flex', justifyContent: 'space-between', marginTop: 10 },
  coordLabel: { fontSize: 12, color: theme.colors.textSecondary },
  coordValue: { fontWeight: 700, marginTop: 2 },
  zonePill: (zone) => ({ marginTop: 12, display: 'inline-block', padding: '6px 10px', borderRadius: 999, background: zone === 'danger' ? 'rgba(239,68,68,0.12)' : 'rgba(22,163,74,0.12)', color: zone === 'danger' ? theme.colors.error : theme.colors.success, fontSize: 12, fontWeight: 600 }),
  statusPill: (status) => ({ padding: '6px 10px', borderRadius: 999, fontSize: 12, fontWeight: 700, color: status === 'closed' ? theme.colors.success : '#B45309', background: status === 'closed' ? 'rgba(22,163,74,0.12)' : 'rgba(245,158,11,0.12)', border: `1px solid ${status === 'closed' ? '#86efac' : '#fde68a'}` }),
  glassBtn: { padding: '10px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.7)', boxShadow: '0 6px 18px rgba(37,99,235,0.15)', color: theme.colors.text, cursor: 'pointer' },

  mapCard: { background: '#fff', border: '1px solid #E6EAF2', borderRadius: 16, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.06)' },
  mapHeader: { padding: theme.spacing.md, borderBottom: '1px solid #E6EAF2', fontWeight: 700 },
  mapCanvas: { position: 'relative', width: '100%', height: 380, background: "url('https://maps.wikimedia.org/img/osm-intl,13,77.2090,28.6139,900x380.png') center/cover no-repeat, linear-gradient(135deg, #E5EEFF, #F8FBFF)", borderBottom: '1px solid #E6EAF2', overflow: 'hidden' },
  pin: { position: 'absolute', width: 14, height: 14, borderRadius: 999, border: '2px solid #fff' },
  legendRow: { display: 'flex', gap: 16, alignItems: 'center', padding: theme.spacing.md },
  legendItem: { display: 'flex', alignItems: 'center', gap: 8, color: theme.colors.textSecondary },
  legendDot: { width: 12, height: 12, borderRadius: 999, display: 'inline-block' },
};

