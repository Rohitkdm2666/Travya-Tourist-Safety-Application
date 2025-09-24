import { useState } from 'react'

export default function TouristRegistration({ onSuccess }) {
  const [form, setForm] = useState({
    fullName: '', email: '', phoneNo: '', nationality: '',
    documentType: '', documentNo: '', registrationPoint: '', checkInDate: '', checkOutDate: ''
  })
  const [photo, setPhoto] = useState(null)
  const [documentPhoto, setDocumentPhoto] = useState(null)
  const [emergencyContacts, setEmergencyContacts] = useState([{ name: '', phoneNo: '', relationship: '' }])
  const [travelItinerary, setTravelItinerary] = useState([{ location: '', date: '', activity: '' }])
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  function updateField(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  function updateArray(setter, index, field, value) {
    setter(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item))
  }

  function addRow(setter, empty) {
    setter(prev => [...prev, empty])
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setMessage('')
    try {
      const data = new FormData()
      data.append('data', JSON.stringify({
        ...form,
        emergencyContacts,
        travelItinerary
      }))
      if (photo) data.append('photo', photo)
      if (documentPhoto) data.append('documentPhoto', documentPhoto)

      const resp = await fetch('http://localhost:5000/api/tourists/register', {
        method: 'POST',
        body: data
      })
      const json = await resp.json()
      if (!resp.ok) throw new Error(json?.error || 'Failed')
      setMessage('Tourist registered successfully!')
      if (typeof onSuccess === 'function') {
        onSuccess()
      }
    } catch (err) {
      setMessage(`Error: ${err.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-white shadow rounded p-6">
      <h2 className="text-2xl font-bold mb-4">Tourist Registration</h2>
      {message && <div className="mb-4 text-sm">{message}</div>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <section>
          <h3 className="text-xl font-semibold mb-2">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input className="border p-2 rounded" name="fullName" placeholder="Full Name" value={form.fullName} onChange={updateField} required />
            <input className="border p-2 rounded" name="email" type="email" placeholder="Email" value={form.email} onChange={updateField} required />
            <input className="border p-2 rounded" name="phoneNo" placeholder="Phone No" value={form.phoneNo} onChange={updateField} required />
            <input className="border p-2 rounded" name="nationality" placeholder="Nationality" value={form.nationality} onChange={updateField} required />
            <div>
              <label className="block mb-1">Photo</label>
              <input className="border p-2 rounded w-full" type="file" accept="image/*" onChange={e => setPhoto(e.target.files?.[0] || null)} />
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-2">Document for Verification</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input className="border p-2 rounded" name="documentType" placeholder="Document Type" value={form.documentType} onChange={updateField} required />
            <input className="border p-2 rounded" name="documentNo" placeholder="Document No" value={form.documentNo} onChange={updateField} required />
            <div>
              <label className="block mb-1">Document Photo</label>
              <input className="border p-2 rounded w-full" type="file" accept="image/*" onChange={e => setDocumentPhoto(e.target.files?.[0] || null)} />
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-2">Travel Info</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input className="border p-2 rounded" name="registrationPoint" placeholder="Registration Point" value={form.registrationPoint} onChange={updateField} required />
            <input className="border p-2 rounded" name="checkInDate" type="date" placeholder="Check-in Date" value={form.checkInDate} onChange={updateField} required />
            <input className="border p-2 rounded" name="checkOutDate" type="date" placeholder="Check-out Date" value={form.checkOutDate} onChange={updateField} required />
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold mb-2">Emergency Contacts</h3>
            <button type="button" className="text-blue-600" onClick={() => addRow(setEmergencyContacts, { name: '', phoneNo: '', relationship: '' })}>+ Add</button>
          </div>
          {emergencyContacts.map((c, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
              <input className="border p-2 rounded" placeholder="Name" value={c.name} onChange={e => updateArray(setEmergencyContacts, i, 'name', e.target.value)} required />
              <input className="border p-2 rounded" placeholder="Phone No" value={c.phoneNo} onChange={e => updateArray(setEmergencyContacts, i, 'phoneNo', e.target.value)} required />
              <input className="border p-2 rounded" placeholder="Relationship" value={c.relationship} onChange={e => updateArray(setEmergencyContacts, i, 'relationship', e.target.value)} required />
            </div>
          ))}
        </section>

        <section>
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold mb-2">Travel Itinerary</h3>
            <button type="button" className="text-blue-600" onClick={() => addRow(setTravelItinerary, { location: '', date: '', activity: '' })}>+ Add</button>
          </div>
          {travelItinerary.map((t, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
              <input className="border p-2 rounded" placeholder="Location" value={t.location} onChange={e => updateArray(setTravelItinerary, i, 'location', e.target.value)} required />
              <input className="border p-2 rounded" type="date" placeholder="Date" value={t.date} onChange={e => updateArray(setTravelItinerary, i, 'date', e.target.value)} required />
              <input className="border p-2 rounded" placeholder="Activity" value={t.activity} onChange={e => updateArray(setTravelItinerary, i, 'activity', e.target.value)} required />
            </div>
          ))}
        </section>

        <div>
          <button disabled={submitting} className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50">
            {submitting ? 'Submitting...' : 'Register Tourist'}
          </button>
        </div>
      </form>
    </div>
  )
}


