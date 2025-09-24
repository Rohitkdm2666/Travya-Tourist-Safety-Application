import React from 'react'

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-black/10 shadow-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between">
          <div className="flex items-center">
            <a href="#" className="text-xl font-semibold tracking-wide">
              Travya
            </a>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <a href="#home" className="text-sm hover:opacity-80 transition-opacity">Home</a>
            <a href="#about" className="text-sm hover:opacity-80 transition-opacity">About</a>
            <a href="#services" className="text-sm hover:opacity-80 transition-opacity">Services</a>
            <a href="#contact" className="text-sm hover:opacity-80 transition-opacity">Contact</a>
          </div>
        </div>
      </div>
    </nav>
  )
}
