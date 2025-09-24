import { useState } from 'react'
import Navbar from './pages/navbar.jsx'
import Home from './pages/home.jsx'
import HomeScreen from './pages/apphome.jsx'
import PoliceDashboard from './pages/policedashboard.jsx'
import ServicesHub from './pages/services.jsx'
import EFIRs from './pages/efirs.jsx'
import AIChat from './pages/aichat.jsx'
import Profile from './pages/profile.jsx'
import PublicDashboard from './pages/publicdashboard.jsx'
import TouristRegistration from './pages/TouristRegistration.jsx'
import WeatherPage from './pages/weather.jsx'
import ReportForm from './pages/reportform.jsx'
import HotelsPage from './pages/hotels.jsx'
import LocalEventsPage from './pages/events.jsx'


import { createBrowserRouter, RouterProvider } from 'react-router-dom'


const router = createBrowserRouter([
  { path: '/', element: <Home/> },
  { path: '/home', element: <Home/> },
  { path: '/apphome', element: <HomeScreen/> },
  { path: '/police', element: <PoliceDashboard/> },
  { path: '/efirs', element: <EFIRs/> },
  { path: '/services', element: <ServicesHub/> },
  { path: '/aichat', element: <AIChat/> },
  { path: '/profile', element: <Profile/> },
  {path:"/public",element:<PublicDashboard/>},
  { path: '/register', element: <TouristRegistration/> },
  { path: '/weather', element: <WeatherPage/> }
  ,{ path: '/report', element: <ReportForm/> }
  ,{ path: '/services/hotels', element: <HotelsPage/> }
  ,{ path: '/services/events', element: <LocalEventsPage/> }
])


function App() {
  
  return (
    
    <div className="App">
    <RouterProvider router={router} />
  </div>
    
  )
}

export default App
