import React, { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-black/10 shadow-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-semibold tracking-wide">
              Travya
            </Link>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm hover:opacity-80 transition-opacity">Home</Link>
            <Link to="/services" className="text-sm hover:opacity-80 transition-opacity">Services</Link>
            <Link to="/register" className="text-sm hover:opacity-80 transition-opacity">Register</Link>
            <Link to="/weather" className="text-sm hover:opacity-80 transition-opacity">Weather</Link>
          </div>
          <button aria-label="Open menu" onClick={() => setOpen(v => !v)} className="md:hidden inline-flex items-center justify-center h-10 w-10 rounded-lg ring-1 ring-black/10 shadow bg-white">
            <div className="flex flex-col items-center justify-center gap-1.5">
              <span className="block h-0.5 w-6 bg-gray-900 rounded" />
              <span className="block h-0.5 w-6 bg-gray-900 rounded" />
              <span className="block h-0.5 w-6 bg-gray-900 rounded" />
            </div>
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden absolute right-3 top-16 z-50 w-44 rounded-xl bg-white ring-1 ring-black/10 shadow">
          <div className="p-2 grid">
            <Link to="/" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm text-gray-900 hover:bg-gray-50">Home</Link>
            <Link to="/services" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm text-gray-900 hover:bg-gray-50">Services</Link>
            <Link to="/register" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm text-gray-900 hover:bg-gray-50">Register</Link>
            <Link to="/weather" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm text-gray-900 hover:bg-gray-50">Weather</Link>
          </div>
        </div>
      )}
    </nav>
  )
}
