import { useState, useEffect } from 'react'
import WeatherFeature from '../components/weatherFeature.jsx'
import TouristRegistration from './pages/TouristRegistration.jsx'


function App() {
  const [isInitializing, setIsInitializing] = useState(true)
  const [view, setView] = useState('weather')

  useEffect(() => {
    // Simulate app initialization
    const timer = setTimeout(() => {
      setIsInitializing(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          {/* App Logo/Icon */}
          <div className="relative mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
              <span className="text-4xl">🌍</span>
            </div>
            {/* Rotating outer ring */}
            <div className="absolute inset-0 w-24 h-24 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
            {/* Pulsing inner ring */}
            <div className="absolute inset-2 w-20 h-20 border-2 border-blue-300 border-t-blue-400 rounded-full animate-pulse mx-auto"></div>
          </div>
          
          {/* App Title */}
          <h1 className="text-3xl font-bold text-blue-800 mb-4 animate-pulse">
            Travya
          </h1>
          
          {/* Loading dots */}
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
          </div>
          
          {/* Loading text */}
          <p className="text-blue-600 text-lg mb-8">
            Initializing Tourist Safety Application...
          </p>
          
          {/* Progress bar */}
          <div className="w-80 h-3 bg-blue-200 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f7f8]">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className='text-2xl font-semibold text-gray-900'>
            Travya - Tourist Safety Application
          </h1>
          <div className="space-x-2">
            <button className={`px-3 py-1.5 rounded border ${view==='weather'?'bg-gray-900 text-white border-gray-900':'bg-white text-gray-800 border-gray-300 hover:bg-gray-50'}`} onClick={()=>setView('weather')}>Weather</button>
            <button className={`px-3 py-1.5 rounded border ${view==='register'?'bg-gray-900 text-white border-gray-900':'bg-white text-gray-800 border-gray-300 hover:bg-gray-50'}`} onClick={()=>setView('register')}>Register Tourist</button>
          </div>
        </div>
        {view === 'weather' && <WeatherFeature />}
        {view === 'register' && <TouristRegistration onSuccess={() => setView('weather')} />}
      </div>
    </div>
  )
}

export default App
