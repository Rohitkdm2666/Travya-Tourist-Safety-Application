import React, { useState } from 'react'
import Navbar from './navbar'

export default function ReportForm() {
  const [form, setForm] = useState({ areaName: '', description: '', reporterName: '', reporterPhone: '' })
  const [coords, setCoords] = useState({ latitude: '', longitude: '' })
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState(null)

  const getLocation = () => {
    if (!('geolocation' in navigator)) {
      setMessage({ type: 'error', text: 'Geolocation not supported' })
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude })
        setMessage({ type: 'info', text: 'Location captured' })
      },
      () => setMessage({ type: 'error', text: 'Unable to fetch location. Enter manually if needed.' })
    )
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage(null)
    try {
      const payload = {
        areaName: form.areaName.trim(),
        description: form.description.trim(),
        reporterName: form.reporterName.trim() || undefined,
        reporterPhone: form.reporterPhone.trim() || undefined,
        latitude: coords.latitude === '' ? undefined : Number(coords.latitude),
        longitude: coords.longitude === '' ? undefined : Number(coords.longitude),
      }
      const resp = await fetch('http://localhost:5000/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const json = await resp.json()
      if (!resp.ok) throw new Error(json.error || 'Failed to submit report')
      setMessage({ type: 'success', text: 'Report submitted successfully' })
      setForm({ areaName: '', description: '', reporterName: '', reporterPhone: '' })
      setCoords({ latitude: '', longitude: '' })
    } catch (e) {
      setMessage({ type: 'error', text: e.message })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <Navbar/>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: 20, marginTop: 64 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>Report Area Issue</h1>
        <p style={{ color: '#5B6472', fontSize: 14, marginBottom: 16 }}>Report unsafe or problematic areas so authorities can take action and zones can be updated.</p>

        {message && (
          <div style={{
            marginBottom: 12,
            padding: 12,
            borderRadius: 12,
            border: '1px solid #E6EAF2',
            background: message.type === 'success' ? '#ECFDF5' : message.type === 'error' ? '#FEF2F2' : '#F8FAFC',
            color: '#0F172A'
          }}>{message.text}</div>
        )}

        <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, marginBottom: 6 }}>Area name</label>
            <input required value={form.areaName} onChange={(e) => setForm({ ...form, areaName: e.target.value })} placeholder="e.g., Mall Road near Gate 2" style={inputStyle} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, marginBottom: 6 }}>Description</label>
            <textarea required rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the issue, time, any details" style={{ ...inputStyle, resize: 'vertical' }} />
          </div>
          <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr' }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, marginBottom: 6 }}>Latitude</label>
              <input value={coords.latitude} onChange={(e) => setCoords({ ...coords, latitude: e.target.value })} placeholder="Optional" style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, marginBottom: 6 }}>Longitude</label>
              <input value={coords.longitude} onChange={(e) => setCoords({ ...coords, longitude: e.target.value })} placeholder="Optional" style={inputStyle} />
            </div>
          </div>
          <div>
            <button type="button" onClick={getLocation} style={secondaryBtn}>Use my current location</button>
          </div>
          <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr' }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, marginBottom: 6 }}>Your name (optional)</label>
              <input value={form.reporterName} onChange={(e) => setForm({ ...form, reporterName: e.target.value })} placeholder="Name" style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, marginBottom: 6 }}>Phone (optional)</label>
              <input value={form.reporterPhone} onChange={(e) => setForm({ ...form, reporterPhone: e.target.value })} placeholder="Phone" style={inputStyle} />
            </div>
          </div>

          <div>
            <button type="submit" disabled={submitting} style={primaryBtn}>{submitting ? 'Submitting…' : 'Submit Report'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 10,
  border: '1px solid #E6EAF2',
  background: '#fff'
}

const primaryBtn = {
  padding: '10px 14px',
  borderRadius: 10,
  border: '1px solid #2563EB22',
  background: '#2563EB',
  color: '#fff'
}

const secondaryBtn = {
  padding: '10px 14px',
  borderRadius: 10,
  border: '1px solid #E6EAF2',
  background: '#fff',
  color: '#0F172A'
}



